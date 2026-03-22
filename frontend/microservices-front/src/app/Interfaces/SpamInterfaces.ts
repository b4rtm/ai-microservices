export interface SpamCheckRequest {
    text: string;
}

export interface SpamCheckResponse {
    category: 'spam' | 'not-spam';
    spam_probability: number;
}

export interface SpamHistoryItem {
    id: number;
    text: string;
    category: 'spam' | 'ham';
    spam_probability: number;
    checked_at: string;
}