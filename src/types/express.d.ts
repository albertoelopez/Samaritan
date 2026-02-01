// Augment Express types to include our User type
declare namespace Express {
  interface User {
    id: string;
    email: string;
    phone_number: string | null;
    password_hash: string;
    role: 'worker' | 'contractor' | 'admin' | 'moderator';
    status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
    first_name: string;
    last_name: string;
    profile_picture_url: string | null;
    email_verified: boolean;
    phone_verified: boolean;
    created_at: Date;
    updated_at: Date;
    last_login_at: Date | null;
    deleted_at: Date | null;
  }
}
