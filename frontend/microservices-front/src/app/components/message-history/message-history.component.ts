import { Component, EventEmitter, Input, Output } from '@angular/core';

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
  styleUrl: './message-history.component.scss',
})
export class MessageHistoryComponent {
  @Input({ required: true }) history: MessageHistoryItem[] = [];
  @Input() isLoading = false;
  @Input() hasMore = true;
  @Output() loadMore = new EventEmitter<void>();
  private readonly loadMoreThrottleMs = 350;
  private lastLoadMoreAt = 0;

  isOpen = false;

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  onScroll(event: Event): void {
    if (this.isLoading || !this.hasMore) {
      return;
    }

    const element = event.target as HTMLElement;
    const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;

    if (remaining < 80) {
      const now = Date.now();

      if (now - this.lastLoadMoreAt < this.loadMoreThrottleMs) {
        return;
      }

      this.lastLoadMoreAt = now;
      this.loadMore.emit();
    }
  }
}
