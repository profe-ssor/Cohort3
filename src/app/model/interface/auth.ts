export interface registerUser {
  username: string;
  gender: string;
  email: string;
  user_type: string;
  password: string;
}
export interface registerResponse{
  message: string;
  id: number;
  user: {
    email: string;
    username: string;
    gender: string;
    user_type: string;
  }
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
  total_normal_users: number;
  total_admins: number;
 total_supervisors: number;
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

export interface supervisor_database {
    user_id: number
    full_name: string
    ghana_card_record: string
    contact: string
    assigned_institution: string
    region_of_posting: string
    assigned_workplace: string
}

export interface supervisors_databaseResponse {
  message: string;
}

export interface nss_database {
  user_id: number
  full_name: string
  ghana_card_record: string
  phone: string
  nss_id: string
  start_date: string
  end_date: string
  assigned_institution: string
  region_of_posting: string
}

export interface nss_databaseResponse {

message: string;
full_name: string;
}
