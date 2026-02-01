import { UserModel, User, UpdateUserInput, UserRole, UserStatus } from '../models/User';
import { WorkerProfileModel, WorkerProfile, UpdateWorkerProfileInput } from '../models/WorkerProfile';
import { ContractorProfileModel, ContractorProfile, UpdateContractorProfileInput } from '../models/ContractorProfile';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export interface UserWithProfile extends Omit<User, 'password_hash'> {
  workerProfile?: WorkerProfile;
  contractorProfile?: ContractorProfile;
}

export class UserService {
  static async getUserById(id: string): Promise<UserWithProfile> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const result: UserWithProfile = UserModel.sanitize(user);

    if (user.role === 'worker') {
      const profile = await WorkerProfileModel.findByUserId(id);
      if (profile) {
        result.workerProfile = profile;
      }
    } else if (user.role === 'contractor') {
      const profile = await ContractorProfileModel.findByUserId(id);
      if (profile) {
        result.contractorProfile = profile;
      }
    }

    return result;
  }

  static async updateUser(id: string, input: UpdateUserInput): Promise<Omit<User, 'password_hash'>> {
    const user = await UserModel.update(id, input);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return UserModel.sanitize(user);
  }

  static async updateWorkerProfile(
    userId: string,
    input: UpdateWorkerProfileInput
  ): Promise<WorkerProfile> {
    const profile = await WorkerProfileModel.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Worker profile not found');
    }

    const updated = await WorkerProfileModel.update(profile.id, input);
    if (!updated) {
      throw new NotFoundError('Failed to update profile');
    }

    return updated;
  }

  static async updateWorkerLocation(
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<WorkerProfile> {
    const profile = await WorkerProfileModel.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Worker profile not found');
    }

    const updated = await WorkerProfileModel.updateLocation(profile.id, latitude, longitude);
    if (!updated) {
      throw new NotFoundError('Failed to update location');
    }

    return updated;
  }

  static async updateContractorProfile(
    userId: string,
    input: UpdateContractorProfileInput
  ): Promise<ContractorProfile> {
    const profile = await ContractorProfileModel.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Contractor profile not found');
    }

    const updated = await ContractorProfileModel.update(profile.id, input);
    if (!updated) {
      throw new NotFoundError('Failed to update profile');
    }

    return updated;
  }

  static async updateContractorLocation(
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<ContractorProfile> {
    const profile = await ContractorProfileModel.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Contractor profile not found');
    }

    const updated = await ContractorProfileModel.updateLocation(profile.id, latitude, longitude);
    if (!updated) {
      throw new NotFoundError('Failed to update location');
    }

    return updated;
  }

  static async deleteUser(id: string, requesterId: string): Promise<void> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const requester = await UserModel.findById(requesterId);
    if (!requester) {
      throw new NotFoundError('Requester not found');
    }

    // Only allow self-deletion or admin deletion
    if (id !== requesterId && requester.role !== 'admin') {
      throw new ForbiddenError('Not authorized to delete this user');
    }

    await UserModel.delete(id);
  }

  static async searchWorkers(
    latitude: number,
    longitude: number,
    radiusKm: number,
    options: { page?: number; limit?: number; categoryId?: string; available?: boolean }
  ): Promise<{ workers: WorkerProfile[]; total: number }> {
    return WorkerProfileModel.findNearby(latitude, longitude, radiusKm, {
      ...options,
      available: options.available ?? true,
    });
  }

  static async searchWorkersByQuery(
    query: string,
    options: { page?: number; limit?: number }
  ): Promise<{ workers: WorkerProfile[]; total: number }> {
    return WorkerProfileModel.search(query, options);
  }

  static async listUsers(options: {
    role?: UserRole;
    status?: UserStatus;
    page?: number;
    limit?: number;
  }): Promise<{ users: Omit<User, 'password_hash'>[]; total: number }> {
    const { users, total } = await UserModel.findAll(options);
    return {
      users: users.map((u) => UserModel.sanitize(u)),
      total,
    };
  }

  static async suspendUser(userId: string, adminId: string): Promise<void> {
    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenError('Only admins can suspend users');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === 'admin') {
      throw new ForbiddenError('Cannot suspend admin users');
    }

    await UserModel.update(userId, { status: 'suspended' });
  }

  static async activateUser(userId: string, adminId: string): Promise<void> {
    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenError('Only admins can activate users');
    }

    await UserModel.update(userId, { status: 'active' });
  }
}
