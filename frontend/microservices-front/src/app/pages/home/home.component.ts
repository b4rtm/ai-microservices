import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageHistoryComponent, MessageHistoryItem } from '../../components/message-history/message-history.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MessageHistoryComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly messageHistory: MessageHistoryItem[] = [
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
}
