export interface SpamCheckRequest {
  text: string;
}

export interface SpamCheckResponse {
  category: 'spam' | 'not-spam';
  spam_probability: number;
}

export interface SpamDTO {
  id: number;
  userId: number;
  text: string;
  category: string;
  prediction: number;
  isDeleted: boolean;
}

export interface SpamPageResponse {
  content: SpamDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
