export type EvaluationType = 'monthly' | 'quarterly' | 'annual' | 'project';
export type EvaluationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type EvaluationPriority = 'low' | 'medium' | 'high';

export interface Evaluation {
  [key: string]: any; // Allow dynamic properties for UploadPDF fields
  id: number;
  title?: string;
  description?: string;
  evaluation_type?: EvaluationType;
  priority?: EvaluationPriority;
  status: EvaluationStatus;
  file?: string | null;
  signed_pdf?: string | null;
  created_at?: string;
  updated_at?: string;
  reviewed_at?: string | null;
  due_date?: string;
  supervisor_comments?: string;
  nss_personnel_name?: string;
  nss_personnel_email?: string;
  supervisor_name?: string;
  supervisor_email?: string;
  administrator_name?: string;
  status_display?: string;
  priority_display?: string;
  type_display?: string;
  is_overdue?: boolean;
  completed_today?: boolean;
  // UploadPDF fields
  file_name?: string;
  form_type?: string;
  uploaded_at?: string;
  is_signed?: boolean;
  sender_name?: string;
  receiver_name?: string;
  submitted_date?: string;
  source?: string;
  user?: number;
}

export interface EvaluationStatusUpdate {
  status: EvaluationStatus;
  supervisor_comments?: string;
}

export interface BulkStatusUpdate {
  evaluation_ids: number[];
  status: 'approved' | 'rejected';
  supervisor_comments?: string;
}

export interface EvaluationDashboardStats {
  total_submissions: number;
  total_pending: number;
  approved: number;
  overdue: number;
  under_review: number;
  completed_today: number;
}

export interface EvaluationListResponse {
  results: Evaluation[];
  count: number;
  total_pages: number;
  current_page: number;
  has_next: boolean;
  has_previous: boolean;
}
