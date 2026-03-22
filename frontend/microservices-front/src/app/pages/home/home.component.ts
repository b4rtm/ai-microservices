import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageHistoryComponent, MessageHistoryItem } from '../../components/message-history/message-history.component';
import { HomeService } from '../../services/home.service';
import { SpamCheckResponse } from '../../Interfaces/SpamInterfaces';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, MessageHistoryComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  messageText = '';
  isSubmitting = false;
  errorMessage = '';
  latestResult: SpamCheckResponse | null = null;

  messageHistory: MessageHistoryItem[] = [
    {
      id: 1,
      preview: 'Claim your prize now! Limited reward waiting. Click this link immediately.',
      status: 'spam',
      confidence: 96,
      checkedAt: 'Today, 09:41'
    },
    {
      id: 2,
      preview: 'Hi team, meeting moved to 15:00. Please confirm your availability.',
      status: 'safe',
      confidence: 91,
      checkedAt: 'Today, 08:14'
    },
    {
      id: 3,
      preview: 'Your account has unusual activity. Verify details now to avoid suspension.',
      status: 'spam',
      confidence: 88,
      checkedAt: 'Yesterday, 17:02'
    },
    {
      id: 4,
      preview: 'Invoice #4421 attached. Payment terms remain 14 days as agreed.',
      status: 'safe',
      confidence: 93,
      checkedAt: 'Yesterday, 11:26'
    }
  ];

  constructor(private readonly homeService: HomeService) {}

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

          const status = response.category === 'spam' ? 'spam' : 'safe';

          this.messageHistory = [
            {
              id: Date.now(),
              preview: text.slice(0, 110),
              status,
              confidence: Math.round(response.spam_probability * 100),
              checkedAt: this.formatCheckedAt()
            },
            ...this.messageHistory
          ];
        },
        error: () => {
          this.errorMessage = 'Prediction request failed. Please make sure the backend is running on localhost:8080.';
        }
      });
  }

  private formatCheckedAt(): string {
    const now = new Date();
    return now.toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  }
}
