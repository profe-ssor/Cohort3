export interface registerUser {
  username: string;
  gender: string;
  email: string;
  user_type: string;
  password: string;
  start_date: string; // Added for batch year validation
}

export interface registerResponse {
  message: string;
  id: number;
  user: registerUser;
}

export interface logUser
{
  email: string;
  password: string;
}

// In your model/interface file (e.g., auth.ts)
export interface LoginResponse {
  message: string;
  access: string;       // Top-level access token
  refresh: string;      // Top-level refresh token
  user: {              // User data
    email: string;
    role: string;
    full_name: string;
    username?: string;  // Optional for backward compatibility
    permissions: {
      is_superuser: boolean;
      is_staff: boolean;
      is_active: boolean;
    };
  };
}

export interface Credentials {
  email: string;
  password: string;
}

export interface UserCounts {
  nss_count: number;
  supervisor_count: number;
  admin_count: number;
}

export interface OtpVerification {
  email: string;
  otp_code: string;
}

export interface OtpResponse {
  message: string;
  email: string;
}

export interface ResendOTP {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
  email: string;
}

export interface LogoutResponse {
  message: string;
}

export interface supervisor_database {
  user_id: number;
  full_name: string;
  ghana_card_record: string;
  contact: string;
  assigned_supervisors: string;
  user: number;
}

export interface supervisors_databaseResponse {
  message: string;
  data: supervisor_database[];
}

export interface nss_database {
  id?: number; // Add this line to match backend data
  user_id: number;
  full_name: string;
  ghana_card_record: string;
  phone: string;
  nss_id: string;
  start_date: string;
  end_date: string;
  assigned_institution: string;
  region_of_posting: string;
  department: string;
}

export interface nss_databaseResponse {
  message: string;
  data: nss_database[];
}

// Password management interfaces
export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordChangeResponse {
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetRequestResponse {
  message: string;
  email: string;
}

export interface PasswordResetConfirm {
  email: string;
  otp_code: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordResetConfirmResponse {
  message: string;
}
