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
    // other PDF fields as needed
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
