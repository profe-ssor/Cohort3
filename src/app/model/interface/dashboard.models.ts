export interface DashboardStats {
  totalSubmissions: number;
  pendingReviews: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  totalPersonnel: number;
  activeSupervisors: number;
  completedToday?: number;
}

export interface SubmissionData {
  id: string;
  personnelName: string;
  personnelId: string;
  supervisorName: string;
  submissionDate: Date;
  status: SubmissionStatus;
  region: string;
  evaluationScore?: number;
  comments?: string;
}

export interface PersonnelData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  region: string;
  district: string;
  serviceYear: string;
  supervisor: string;
  status: PersonnelStatus;
  joinDate: Date;
  completionDate?: Date;
}

export interface SupervisorData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  organization: string;
  region: string;
  personnelCount: number;
  status: SupervisorStatus;
}

export interface ActivityLog {
  id: number | string;
  action: string;
  title: string;
  description: string;
  personnel?: string;
  timestamp: string | Date;
  priority?: string;
  supervisor?: number;
  // Optional/mock fields for frontend compatibility
  performedBy?: string;
  relatedId?: string;
  severity?: ActivitySeverity;
}

export interface RegionalData {
  region: string;
  totalPersonnel: number;
  pendingSubmissions: number;
  completedSubmissions: number;
  supervisorCount: number;
}

export enum SubmissionStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESUBMITTED = 'resubmitted'
}

export enum PersonnelStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated'
}

export enum SupervisorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_APPROVAL = 'pending_approval'
}

export enum ActivitySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  lastLogin: Date;
  avatar?: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  REGIONAL_ADMIN = 'regional_admin',
  DISTRICT_ADMIN = 'district_admin',
  SUPERVISOR = 'supervisor'
}
