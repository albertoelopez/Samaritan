// User Types
export type UserType = 'worker' | 'contractor';

export interface User {
  id: string;
  email: string;
  phone: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Worker extends User {
  userType: 'worker';
  profile: WorkerProfile;
}

export interface Contractor extends User {
  userType: 'contractor';
  profile: ContractorProfile;
}

export interface WorkerProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio: string;
  skills: Skill[];
  experience: string;
  hourlyRate: number;
  availability: Availability[];
  location: Location;
  rating: number;
  reviewCount: number;
  verified: boolean;
  documents?: Document[];
}

export interface ContractorProfile {
  companyName: string;
  contactName: string;
  logo?: string;
  description: string;
  website?: string;
  location: Location;
  rating: number;
  reviewCount: number;
  verified: boolean;
  businessLicense?: string;
}

// Job Types
export interface Job {
  id: string;
  contractorId: string;
  contractor?: Contractor;
  title: string;
  description: string;
  category: JobCategory;
  skills: Skill[];
  location: Location;
  startDate: Date;
  endDate?: Date;
  duration: string;
  payRate: PayRate;
  status: JobStatus;
  applicants: Application[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JobCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface PayRate {
  amount: number;
  type: 'hourly' | 'daily' | 'fixed';
  currency: string;
}

export type JobStatus = 'draft' | 'active' | 'filled' | 'completed' | 'cancelled';

// Application Types
export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  worker?: Worker;
  message: string;
  proposedRate?: number;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

// Location Types
export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Availability Types
export interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// Message Types
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

// Review Types
export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  jobId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Document Types
export interface Document {
  id: string;
  type: DocumentType;
  url: string;
  verified: boolean;
  expiryDate?: Date;
}

export type DocumentType = 'id' | 'license' | 'insurance' | 'certification' | 'other';