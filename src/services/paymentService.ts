import Stripe from 'stripe';
import { config } from '../config/environment';
import { PaymentMethodModel, PaymentMethod, PaymentMethodType } from '../models/PaymentMethod';
import { TransactionModel, Transaction, TransactionType } from '../models/Transaction';
import { ContractModel } from '../models/Contract';
import { MilestoneModel } from '../models/Milestone';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { calculatePlatformFee } from '../utils/helpers';
import { NotificationService } from './notificationService';
import { WorkerProfileModel } from '../models/WorkerProfile';

const stripe = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey, { apiVersion: '2023-10-16' })
  : null;

export class PaymentService {
  static async addPaymentMethod(
    userId: string,
    type: PaymentMethodType,
    stripePaymentMethodId: string
  ): Promise<PaymentMethod> {
    if (!stripe) {
      throw new BadRequestError('Payment processing is not configured');
    }

    // Get or create Stripe customer
    const existingMethods = await PaymentMethodModel.findByUserId(userId);
    let customerId = existingMethods[0]?.provider_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(stripePaymentMethodId, {
      customer: customerId,
    });

    // Get payment method details
    const stripeMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);

    const isDefault = existingMethods.length === 0;

    return PaymentMethodModel.create({
      user_id: userId,
      type,
      is_default: isDefault,
      provider_customer_id: customerId,
      provider_payment_method_id: stripePaymentMethodId,
      last_four: stripeMethod.card?.last4 || null,
      brand: stripeMethod.card?.brand || null,
      exp_month: stripeMethod.card?.exp_month || null,
      exp_year: stripeMethod.card?.exp_year || null,
    });
  }

  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return PaymentMethodModel.findByUserId(userId);
  }

  static async removePaymentMethod(paymentMethodId: string, userId: string): Promise<void> {
    const method = await PaymentMethodModel.findById(paymentMethodId);
    if (!method) {
      throw new NotFoundError('Payment method not found');
    }

    if (method.user_id !== userId) {
      throw new ForbiddenError('Not authorized to remove this payment method');
    }

    if (stripe && method.provider_payment_method_id) {
      await stripe.paymentMethods.detach(method.provider_payment_method_id);
    }

    await PaymentMethodModel.delete(paymentMethodId);
  }

  static async setDefaultPaymentMethod(paymentMethodId: string, userId: string): Promise<PaymentMethod> {
    const method = await PaymentMethodModel.findById(paymentMethodId);
    if (!method) {
      throw new NotFoundError('Payment method not found');
    }

    if (method.user_id !== userId) {
      throw new ForbiddenError('Not authorized to update this payment method');
    }

    const updated = await PaymentMethodModel.setDefault(paymentMethodId);
    if (!updated) {
      throw new NotFoundError('Failed to update payment method');
    }

    return updated;
  }

  static async processPayment(
    contractId: string,
    payerId: string,
    amount: number,
    type: TransactionType = 'payment',
    milestoneId?: string
  ): Promise<Transaction> {
    if (!stripe) {
      throw new BadRequestError('Payment processing is not configured');
    }

    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    const payerPaymentMethod = await PaymentMethodModel.findDefault(payerId);
    if (!payerPaymentMethod) {
      throw new BadRequestError('No payment method found');
    }

    const { fee, netAmount } = calculatePlatformFee(amount, config.stripe.platformFeePercent);

    // Create transaction record
    const transaction = await TransactionModel.create({
      contract_id: contractId,
      milestone_id: milestoneId || null,
      time_entry_id: null,
      payer_id: payerId,
      payee_id: contract.worker_id,
      payment_method_id: payerPaymentMethod.id,
      type,
      amount,
      currency: 'USD',
      platform_fee: fee,
      net_amount: netAmount,
      provider_transaction_id: null,
      provider_response: null,
      description: `Payment for contract ${contractId}`,
    });

    try {
      await TransactionModel.markProcessing(transaction.id);

      // Process with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency: 'usd',
        customer: payerPaymentMethod.provider_customer_id!,
        payment_method: payerPaymentMethod.provider_payment_method_id!,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        metadata: {
          contractId,
          transactionId: transaction.id,
        },
      });

      await TransactionModel.markCompleted(
        transaction.id,
        paymentIntent.id,
        { paymentIntent: paymentIntent.id }
      );

      // Update contract paid amount
      await ContractModel.addPayment(contractId, amount);

      // Mark milestone as paid if applicable
      if (milestoneId) {
        await MilestoneModel.markPaid(milestoneId);
      }

      // Notify worker
      const worker = await WorkerProfileModel.findById(contract.worker_id);
      if (worker) {
        await NotificationService.createNotification({
          userId: worker.user_id,
          type: 'payment_received',
          title: 'Payment Received',
          message: `You received a payment of $${amount.toFixed(2)}`,
          data: { contractId, transactionId: transaction.id, amount },
        });
      }

      return (await TransactionModel.findById(transaction.id))!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      await TransactionModel.markFailed(transaction.id, errorMessage);
      throw new BadRequestError(errorMessage);
    }
  }

  static async getTransactionHistory(
    userId: string,
    options: { page?: number; limit?: number; type?: TransactionType }
  ): Promise<{ transactions: Transaction[]; total: number }> {
    return TransactionModel.findByUserId(userId, options);
  }

  static async getContractTransactions(
    contractId: string,
    options: { page?: number; limit?: number }
  ): Promise<{ transactions: Transaction[]; total: number }> {
    return TransactionModel.findByContractId(contractId, options);
  }

  static async processRefund(transactionId: string, adminId: string): Promise<Transaction> {
    if (!stripe) {
      throw new BadRequestError('Payment processing is not configured');
    }

    const originalTransaction = await TransactionModel.findById(transactionId);
    if (!originalTransaction) {
      throw new NotFoundError('Transaction not found');
    }

    if (originalTransaction.status !== 'completed') {
      throw new BadRequestError('Can only refund completed transactions');
    }

    if (!originalTransaction.provider_transaction_id) {
      throw new BadRequestError('No provider transaction ID found');
    }

    // Create refund transaction
    const refundTransaction = await TransactionModel.create({
      contract_id: originalTransaction.contract_id,
      milestone_id: originalTransaction.milestone_id,
      time_entry_id: originalTransaction.time_entry_id,
      payer_id: originalTransaction.payee_id, // Swap payer and payee
      payee_id: originalTransaction.payer_id,
      payment_method_id: originalTransaction.payment_method_id,
      type: 'refund',
      amount: originalTransaction.amount,
      currency: originalTransaction.currency,
      platform_fee: 0,
      net_amount: originalTransaction.amount,
      provider_transaction_id: null,
      provider_response: null,
      description: `Refund for transaction ${transactionId}`,
    });

    try {
      const refund = await stripe.refunds.create({
        payment_intent: originalTransaction.provider_transaction_id,
      });

      await TransactionModel.markCompleted(
        refundTransaction.id,
        refund.id,
        { refund: refund.id }
      );

      return (await TransactionModel.findById(refundTransaction.id))!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Refund processing failed';
      await TransactionModel.markFailed(refundTransaction.id, errorMessage);
      throw new BadRequestError(errorMessage);
    }
  }
}
