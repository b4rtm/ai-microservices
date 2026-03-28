import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageHistoryComponent, MessageHistoryItem } from '../../components/message-history/message-history.component';
import { HomeService } from '../../services/home.service';
import { SpamCheckResponse, SpamDTO } from '../../Interfaces/SpamInterfaces';
import { HistoryService } from '../../services/history.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, MessageHistoryComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  messageText = '';
  isSubmitting = false;
  errorMessage = '';
  latestResult: SpamCheckResponse | null = null;
  private readonly fallbackUserId = 1;
  private readonly historyPageSize = 25;
  private historyPage = 0;
  hasMoreHistory = true;
  isLoadingHistory = false;

  messageHistory: MessageHistoryItem[] = [];

  constructor(
    private readonly homeService: HomeService,
    private readonly historyService: HistoryService
  ) {}

  ngOnInit(): void {
    this.loadHistory(true);
  }

  checkForSpam(): void {
    const text = this.messageText.trim();

    if (!text) {
      this.errorMessage = 'Please enter a message before checking.';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    this.homeService
      .predictSpam({ text })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.latestResult = response;
          this.loadHistory(true);
        },
        error: () => {
          this.errorMessage = 'Prediction request failed. Please make sure the backend is running on localhost:8080.';
        }
      });
  }

  onHistoryScrollEnd(): void {
    this.loadHistory();
  }

  private loadHistory(reset = false): void {
    if (this.isLoadingHistory) {
      return;
    }

    if (reset) {
      this.historyPage = 0;
      this.hasMoreHistory = true;
      this.messageHistory = [];
    }

    if (!this.hasMoreHistory) {
      return;
    }

    this.isLoadingHistory = true;
    const userId = this.resolveUserId();

    this.historyService.getUserHistory(userId, this.historyPage, this.historyPageSize).subscribe({
      next: (response) => {
        const mapped = response.content
          .filter((item) => !item.isDeleted)
          .map((item) => this.mapToHistoryItem(item));

        if (reset) {
          this.messageHistory = mapped;
        } else {
          this.messageHistory = [...this.messageHistory, ...mapped];
        }

        this.historyPage += 1;
        this.hasMoreHistory = this.historyPage < response.totalPages;
      },
      error: () => {
        this.errorMessage = 'History request failed. Please make sure the backend is running on localhost:8080.';
        this.isLoadingHistory = false;
      },
      complete: () => {
        this.isLoadingHistory = false;
      }
    });
  }

  private mapToHistoryItem(item: SpamDTO): MessageHistoryItem {
    return {
      id: item.id,
      preview: item.text.slice(0, 110),
      status: item.category === 'spam' ? 'spam' : 'safe',
      confidence: this.toPercent(item.prediction),
      checkedAt: `Entry #${item.id}`
    };
  }

  private toPercent(value: number): number {
    const normalized = value <= 1 ? value * 100 : value;
    return Math.max(0, Math.min(100, Math.round(normalized)));
  }

  private resolveUserId(): number {
    const storedUserId = localStorage.getItem('userId');
    const parsed = Number(storedUserId);

    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }

    return this.fallbackUserId;
  }
}
