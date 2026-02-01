import { User } from '../models/User';
import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';

import { asyncHandler } from '../middleware/errorHandler.middleware';
import { TransactionType } from '../models/Transaction';

export const addPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const { type, stripePaymentMethodId } = req.body;

  const method = await PaymentService.addPaymentMethod(
    (req.user as User).id,
    type,
    stripePaymentMethodId
  );

  res.status(201).json({
    status: 'success',
    data: method,
  });
});

export const getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
  const methods = await PaymentService.getPaymentMethods((req.user as User).id);

  res.json({
    status: 'success',
    data: methods,
  });
});

export const removePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await PaymentService.removePaymentMethod(id!, (req.user as User).id);

  res.json({
    status: 'success',
    message: 'Payment method removed',
  });
});

export const setDefaultPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const method = await PaymentService.setDefaultPaymentMethod(id!, (req.user as User).id);

  res.json({
    status: 'success',
    data: method,
  });
});

export const processPayment = asyncHandler(async (req: Request, res: Response) => {
  const { contractId, amount, milestoneId } = req.body;

  const transaction = await PaymentService.processPayment(
    contractId,
    (req.user as User).id,
    amount,
    'payment',
    milestoneId
  );

  res.status(201).json({
    status: 'success',
    data: transaction,
  });
});

export const getTransactionHistory = asyncHandler(async (req: Request, res: Response) => {
  const { type, page, limit } = req.query;

  const result = await PaymentService.getTransactionHistory((req.user as User).id, {
    type: type as TransactionType,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});

export const getContractTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { contractId } = req.params;
  const { page, limit } = req.query;

  const result = await PaymentService.getContractTransactions(contractId!, {
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});

export const processRefund = asyncHandler(async (req: Request, res: Response) => {
  const { transactionId } = req.params;

  const transaction = await PaymentService.processRefund(transactionId!, (req.user as User).id);

  res.json({
    status: 'success',
    data: transaction,
  });
});
