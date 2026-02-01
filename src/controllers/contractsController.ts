import { User } from '../models/User';
import { Request, Response } from 'express';
import { ContractService } from '../services/contractService';

import { asyncHandler } from '../middleware/errorHandler.middleware';
import { ContractStatus } from '../models/Contract';

export const createContract = asyncHandler(async (req: Request, res: Response) => {
  const {
    jobId,
    workerId,
    applicationId,
    agreedRate,
    paymentType,
    totalAmount,
    startDate,
    endDate,
    termsAndConditions,
    milestones,
  } = req.body;

  const contract = await ContractService.createContract((req.user as User).id, {
    jobId,
    workerId,
    applicationId,
    agreedRate,
    paymentType,
    totalAmount,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : undefined,
    termsAndConditions,
    milestones,
  });

  res.status(201).json({
    status: 'success',
    data: contract,
  });
});

export const getContract = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const contract = await ContractService.getContract(id!);

  res.json({
    status: 'success',
    data: contract,
  });
});

export const signContract = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const contract = await ContractService.signContract(id!, (req.user as User).id);

  res.json({
    status: 'success',
    data: contract,
  });
});

export const completeContract = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const contract = await ContractService.completeContract(id!, (req.user as User).id);

  res.json({
    status: 'success',
    data: contract,
  });
});

export const terminateContract = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const contract = await ContractService.terminateContract(id!, (req.user as User).id);

  res.json({
    status: 'success',
    data: contract,
  });
});

export const getMyContractsAsContractor = asyncHandler(async (req: Request, res: Response) => {
  const { status, page, limit } = req.query;

  const result = await ContractService.getContractorContracts((req.user as User).id, {
    status: status as ContractStatus,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});

export const getMyContractsAsWorker = asyncHandler(async (req: Request, res: Response) => {
  const { status, page, limit } = req.query;

  const result = await ContractService.getWorkerContracts((req.user as User).id, {
    status: status as ContractStatus,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});
