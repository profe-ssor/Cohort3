export interface IMessage {
  id: number;
  sender: number;
  receiver: number;
  sender_name: string;
  receiver_name: string;
  content: string;
  attachment: number | null;
  attachment_details?: {
    id: number;
    file_name: string;
    signed_file: string;
  };
  timestamp: string;
  is_read: boolean;
}

export interface IMessageSendResponse {
  success: string;
  message: IMessage;
}

export interface InboxResponse {
  inbox: IMessage[];
}


export interface IInbox {
  id: number
  sender: number
  receiver: number
  sender_name: string
  receiver_name: string
  content: string
  attachment: number
  attachment_details: IAttachmentDetails
  timestamp: string
  is_read: boolean
  reply_to: number
  reply_to_content: string
}

export interface IAttachmentDetails {
  id: number
  file_name: string
  file: string
  signature_image: any
  signature_drawing: any
  is_signed: boolean
  signed_file: string
  uploaded_at: string
}
