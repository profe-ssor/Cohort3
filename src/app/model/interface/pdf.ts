export interface PDF {
  id: number;
  file_name: string;
  file: string;
  signature_image: string | null;
  signature_drawing: string | null;
  is_signed: boolean;
  signed_file: string | null;
  uploaded_at: string;
  form_type?: 'Monthly' | 'Quarterly' | 'Annual' | 'Project' | 'General';
  priority?: 'low' | 'medium' | 'high';
  receiver?: number;
  filePath?: string,
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



