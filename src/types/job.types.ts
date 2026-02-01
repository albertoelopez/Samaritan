export interface Job {
  id: string;
  contractorId: string;
  title: string;
  description: string;
  category: JobCategory;
  subcategory?: string;
  location: JobLocation;
  requirements: JobRequirements;
  compensation: JobCompensation;
  schedule: JobSchedule;
  status: JobStatus;
  urgency: JobUrgency;
  workersNeeded: number;
  workersAssigned: number;
  applicationsCount: number;
  tags: string[];
  images?: string[];
  documents?: string[];
  isPublic: boolean;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  weatherDependent: boolean;
  safetyRequirements: string[];
  toolsRequired: string[];
  materialsProvided: boolean;
  parkingAvailable: boolean;
  accessInstructions?: string;
  specialInstructions?: string;
  contractorRating: number;
  contractorReviewCount: number;
  postedAt: string;
  startsAt: string;
  endsAt?: string;
  expiresAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  // UI state
  isOptimistic?: boolean;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

export interface JobLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radiusKm?: number; // For jobs that allow workers within a radius
}

export interface JobRequirements {
  experienceLevel: ExperienceLevel;
  skillsRequired: string[];
  certificationsRequired: string[];
  backgroundCheckRequired: boolean;
  drugTestRequired: boolean;
  physicalRequirements: string[];
  minAge?: number;
  languageRequirements?: string[];
  transportationRequired: boolean;
  ownToolsRequired: boolean;
}

export interface JobCompensation {
  type: CompensationType;
  amount: number;
  currency: 'USD';
  paymentSchedule: PaymentSchedule;
  overtime: boolean;
  overtimeRate?: number;
  bonusStructure?: BonusStructure[];
  tipsAllowed: boolean;
  expensesReimbursed: boolean;
}

export interface JobSchedule {
  type: ScheduleType;
  startDate: string;
  endDate?: string;
  startTime: string; // HH:MM
  endTime?: string; // HH:MM
  timeZone: string;
  flexibleHours: boolean;
  breakDuration: number; // minutes
  weeklyHours?: number;
  daysOfWeek?: DayOfWeek[];
}

export interface RecurringPattern {
  frequency: RecurringFrequency;
  interval: number; // every N days/weeks/months
  endDate?: string;
  maxOccurrences?: number;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
}

export interface BonusStructure {
  type: 'completion' | 'quality' | 'speed' | 'safety';
  description: string;
  amount: number;
  conditions: string[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  workerId: string;
  coverLetter?: string;
  proposedRate?: number;
  availableFrom: string;
  availableTo?: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  responseMessage?: string;
  interviewScheduledAt?: string;
  backgroundCheckStatus?: BackgroundCheckStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobMatch {
  jobId: string;
  workerId: string;
  score: number; // 0-100
  factors: MatchFactor[];
  distance: number; // in km
  ratingMatch: number;
  skillMatch: number;
  experienceMatch: number;
  availabilityMatch: number;
  priceMatch: number;
  calculatedAt: string;
}

export interface MatchFactor {
  type: 'skills' | 'experience' | 'location' | 'rating' | 'availability' | 'price';
  weight: number;
  score: number;
  details: string;
}

// Enums
export enum JobCategory {
  GENERAL_LABOR = 'GENERAL_LABOR',
  CONSTRUCTION = 'CONSTRUCTION',
  LANDSCAPING = 'LANDSCAPING',
  MOVING = 'MOVING',
  CLEANING = 'CLEANING',
  PAINTING = 'PAINTING',
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  ROOFING = 'ROOFING',
  CARPENTRY = 'CARPENTRY',
  MASONRY = 'MASONRY',
  FLOORING = 'FLOORING',
  HVAC = 'HVAC',
  DEMOLITION = 'DEMOLITION',
  DELIVERY = 'DELIVERY',
  EVENT_SETUP = 'EVENT_SETUP',
  WAREHOUSE = 'WAREHOUSE',
  MANUFACTURING = 'MANUFACTURING',
  AGRICULTURE = 'AGRICULTURE',
  OTHER = 'OTHER'
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum JobUrgency {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ExperienceLevel {
  ENTRY_LEVEL = 'ENTRY_LEVEL',
  SOME_EXPERIENCE = 'SOME_EXPERIENCE',
  EXPERIENCED = 'EXPERIENCED',
  EXPERT = 'EXPERT'
}

export enum CompensationType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  PROJECT = 'PROJECT',
  PIECE_RATE = 'PIECE_RATE'
}

export enum PaymentSchedule {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  PROJECT_END = 'PROJECT_END'
}

export enum ScheduleType {
  FIXED = 'FIXED',
  FLEXIBLE = 'FLEXIBLE',
  ON_CALL = 'ON_CALL'
}

export enum RecurringFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  BACKGROUND_CHECK = 'BACKGROUND_CHECK',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

// State interfaces
export interface JobsState {
  entities: Record<string, Job>;
  ids: string[];
  filter: JobFilter;
  selectedJobId: string | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  realTimeUpdates: boolean;
  optimisticUpdates: string[]; // job IDs with pending optimistic updates
}

export interface JobFilter {
  category: JobCategory | null;
  location: {
    coordinates?: { latitude: number; longitude: number };
    radius?: number; // km
    city?: string;
    state?: string;
  } | null;
  priceRange: {
    min: number;
    max: number;
  } | null;
  experienceLevel: ExperienceLevel | null;
  urgency: JobUrgency | null;
  status: JobStatus | 'active' | 'all';
  availability: {
    startDate?: string;
    endDate?: string;
  } | null;
  sortBy: 'createdAt' | 'distance' | 'payment' | 'urgency' | 'match_score';
  sortOrder: 'asc' | 'desc';
  searchQuery?: string;
  tags?: string[];
}

export interface JobApplicationsState {
  entities: Record<string, JobApplication>;
  ids: string[];
  byJobId: Record<string, string[]>; // job ID -> application IDs
  byWorkerId: Record<string, string[]>; // worker ID -> application IDs
  isLoading: boolean;
  error: string | null;
}

export interface JobMatchState {
  matches: Record<string, JobMatch[]>; // worker ID -> matches
  isLoading: boolean;
  error: string | null;
  lastCalculated: number | null;
  preferences: MatchPreferences;
}

export interface MatchPreferences {
  maxDistance: number; // km
  minRating: number;
  skillWeights: Record<string, number>;
  preferredCategories: JobCategory[];
  minPayRate: number;
  maxPayRate: number;
  availabilityBuffer: number; // hours
}