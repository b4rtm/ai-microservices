import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  MessageHistoryComponent,
  MessageHistoryItem,
  MessageStatus,
} from '../../components/message-history/message-history.component';
import { HomeService } from '../../services/home.service';
import { SpamCheckResponse, SpamDTO } from '../../Interfaces/SpamInterfaces';
import { HistoryService } from '../../services/history.service';
import { finalize } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, MessageHistoryComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  messageText = '';
  isSubmitting = false;
  isAdmin = false;
  latestResult: SpamCheckResponse | null = null;
  private userId: number | null = null;
  private readonly historyPageSize = 25;
  private historyPage = 0;
  hasMoreHistory = true;
  isLoadingHistory = false;

  messageHistory: MessageHistoryItem[] = [];

  constructor(
    private readonly homeService: HomeService,
    private readonly historyService: HistoryService,
    private readonly toastService: ToastService,
    private readonly loginService: LoginService,
  ) {}

  ngOnInit(): void {
    this.userId = this.resolveUserId();
    this.isAdmin = this.resolveIsAdmin();
    this.loadHistory(true);
  }

  checkForSpam(useBertModel = false): void {
    const text = this.messageText.trim();

    if (!text) {
      this.toastService.warning('Please enter a message before checking.');
      return;
    }

    this.isSubmitting = true;

    const predictionRequest = useBertModel
      ? this.homeService.predictSpamBert({ text })
      : this.homeService.predictSpam({ text });

    predictionRequest
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          this.latestResult = response;
          this.loadHistory(true);
        },
        error: () => {
          this.toastService.error(
            'Prediction request failed. Please make sure the backend is running on localhost:8080.',
          );
        },
      });
  }

  onHistoryScrollEnd(): void {
    this.loadHistory();
  }

  onHistoryButtonClick(): void {
    this.loadHistory(true);
  }

  getLatestResultStatus(): MessageStatus | null {
    if (!this.latestResult) {
      return null;
    }

    return this.getStatusByPercent(this.toPercent(this.latestResult.spam_probability));
  }

  getLatestResultLabel(): string {
    const status = this.getLatestResultStatus();

    if (status === 'spam') {
      return 'Spam detected';
    }

    if (status === 'probably-spam') {
      return 'Probably spam';
    }

    return 'Looks safe';
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

    if (this.userId === null) {
      this.hasMoreHistory = false;
      this.toastService.error('Missing user session. Please sign in again.');
      return;
    }

    this.isLoadingHistory = true;

    this.historyService.getUserHistory(this.userId, this.historyPage, this.historyPageSize).subscribe({
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
        this.toastService.error(
          'History request failed. Please make sure the backend is running on localhost:8080.',
        );
        this.isLoadingHistory = false;
      },
      complete: () => {
        this.isLoadingHistory = false;
      },
    });
  }

  private mapToHistoryItem(item: SpamDTO): MessageHistoryItem {
    const confidence = this.toPercent(item.prediction);

    return {
      id: item.id,
      preview: item.text.slice(0, 110),
      status: this.getStatusByPercent(confidence),
      confidence,
      checkedAt: `Entry #${item.id}`,
    };
  }

  private getStatusByPercent(percent: number): MessageStatus {
    if (percent <= 50) {
      return 'safe';
    }

    if (percent <= 75) {
      return 'probably-spam';
    }

    return 'spam';
  }

  private toPercent(value: number): number {
    const normalized = value <= 1 ? value * 100 : value;
    return Math.max(0, Math.min(100, Math.round(normalized)));
  }

  private resolveUserId(): number | null {
    const storedUserId = localStorage.getItem('userId');
    const parsed = Number(storedUserId);

    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }

    return null;
  }

  private resolveIsAdmin(): boolean {
    const role = (localStorage.getItem('role') ?? '').trim().toUpperCase();
    return role === 'ADMIN';
  }

  onSignOut() {
    this.loginService.logout();
  }
}
