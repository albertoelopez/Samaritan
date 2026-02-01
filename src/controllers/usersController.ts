import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { asyncHandler } from '../middleware/errorHandler.middleware';
import { User, UserRole, UserStatus } from '../models/User';

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await UserService.getUserById(id!);

  res.json({
    status: 'success',
    data: user,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, phoneNumber } = req.body;

  const user = await UserService.updateUser((req.user as User).id, {
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber,
  });

  res.json({
    status: 'success',
    data: user,
  });
});

export const updateWorkerProfile = asyncHandler(async (req: Request, res: Response) => {
  const {
    bio,
    hourlyRateMin,
    hourlyRateMax,
    yearsOfExperience,
    availableForWork,
    serviceRadiusKm,
  } = req.body;

  const profile = await UserService.updateWorkerProfile((req.user as User).id, {
    bio,
    hourly_rate_min: hourlyRateMin,
    hourly_rate_max: hourlyRateMax,
    years_of_experience: yearsOfExperience,
    available_for_work: availableForWork,
    service_radius_km: serviceRadiusKm,
  });

  res.json({
    status: 'success',
    data: profile,
  });
});

export const updateContractorProfile = asyncHandler(async (req: Request, res: Response) => {
  const { companyName, companyDescription, companySize, industry, websiteUrl } = req.body;

  const profile = await UserService.updateContractorProfile((req.user as User).id, {
    company_name: companyName,
    company_description: companyDescription,
    company_size: companySize,
    industry,
    website_url: websiteUrl,
  });

  res.json({
    status: 'success',
    data: profile,
  });
});

export const updateLocation = asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude } = req.body;
  const userRole = (req.user as User).role;

  let result;
  if (userRole === 'worker') {
    result = await UserService.updateWorkerLocation((req.user as User).id, latitude, longitude);
  } else if (userRole === 'contractor') {
    result = await UserService.updateContractorLocation((req.user as User).id, latitude, longitude);
  }

  res.json({
    status: 'success',
    data: result,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await UserService.deleteUser(id!, (req.user as User).id);

  res.json({
    status: 'success',
    message: 'User deleted successfully',
  });
});

export const searchWorkers = asyncHandler(async (req: Request, res: Response) => {
  const {
    latitude,
    longitude,
    radiusKm = 50,
    categoryId,
    available,
    page,
    limit,
  } = req.query;

  const result = await UserService.searchWorkers(
    parseFloat(latitude as string),
    parseFloat(longitude as string),
    parseFloat(radiusKm as string),
    {
      categoryId: categoryId as string,
      available: available === 'true',
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    }
  );

  res.json({
    status: 'success',
    data: result,
  });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, status, page, limit } = req.query;

  const result = await UserService.listUsers({
    role: role as UserRole,
    status: status as UserStatus,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});

export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await UserService.suspendUser(id!, (req.user as User).id);

  res.json({
    status: 'success',
    message: 'User suspended successfully',
  });
});

export const activateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await UserService.activateUser(id!, (req.user as User).id);

  res.json({
    status: 'success',
    message: 'User activated successfully',
  });
});
