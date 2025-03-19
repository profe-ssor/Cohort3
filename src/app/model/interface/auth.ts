export interface User {
  username: string;
  date_of_birth: string;
  gender: string;
  ghana_card: string;
  nss_id: string;
  email: string;
  phone: string;
  resident_address: string;
  assigned_institution : string;
  start_date: string;
  end_date: string;
  region_of_posting: string;
  password: string;
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
  total_users: number;
  nssmembers_count: number;
  supervisors_count: number;
  admins_count: number;
}

export interface OtpVerification {
  email: string;
  otp_code: string;
}

export interface OtpResponse {
  message: string;
}

export interface ResendOTP {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}