export type EvaluationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type EvaluationType = 'monthly' | 'quarterly' | 'annual' | 'project';
export type EvaluationPriority = 'low' | 'medium' | 'high';


export interface PDF {
  id: number;
  file_name: string;
  file: string;
  signature_image: string | null;
  signature_drawing: string | null;
  is_signed: boolean;
  signed_file: string | null;
  uploaded_at: string;
  form_type?: 'Monthly' | 'Quarterly' | 'Annual' | 'Project';
  priority?: 'low' | 'medium' | 'high';
  receiver?: number;
  filePath?: string;
  mark_as_signed?: boolean;
  sender_name?: string;
  receiver_name?: string


  // ✅ New fields added:
  submitted_date?: string;
  due_date?: string;
status?: EvaluationStatus;
}


export interface SignaturePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}




export interface PdfUploadResponse {
  message: string;
  data: PDF;
}

export interface PdfSignResponse {
  message: string;
  data: PDF;
}



