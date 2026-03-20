import { Component, Input } from '@angular/core';

export type MessageStatus = 'spam' | 'safe';

export interface MessageHistoryItem {
  id: number;
  preview: string;
  status: MessageStatus;
  confidence: number;
  checkedAt: string;
}

@Component({
  selector: 'app-message-history',
  standalone: true,
  templateUrl: './message-history.component.html',
  styleUrl: './message-history.component.scss'
})
export class MessageHistoryComponent {
  @Input({ required: true }) history: MessageHistoryItem[] = [];

  isOpen = false;

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }
}
