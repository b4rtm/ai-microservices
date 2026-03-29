import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { HistoryService } from '../../services/history.service';
import { SpamDTO } from '../../Interfaces/SpamInterfaces';
import { ToastService } from '../../services/toast.service';

type MessageStatus = 'spam' | 'safe';

interface MessageHistoryItem {
  id: number;
  preview: string;
  status: MessageStatus;
  confidence: number;
  checkedAt: string;
}

interface AdminUser {
  id: number;
  email: string;
  role: string;
  blocked: boolean;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-panel-2.component.html',
  styleUrl: './admin-panel-2.component.scss',
})
export class AdminPanel2Component implements OnInit {
  users: AdminUser[] = [
    { id: 1, email: 'user1@example.com', role: 'user', blocked: false },
    { id: 2, email: 'user2@example.com', role: 'admin', blocked: false },
    { id: 3, email: 'user3@example.com', role: 'user', blocked: true },
  ];
  selectedUser: AdminUser | null = null;
  selectedUserHistory: MessageHistoryItem[] = [];
  isLoadingSelectedHistory = false;
  private readonly historyPageSize = 25;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private historyService: HistoryService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {}

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  showUserHistory(user: AdminUser): void {
    this.selectedUser = user;
    this.selectedUserHistory = [];
    this.isLoadingSelectedHistory = true;

    this.historyService.getUserHistory(user.id, 0, this.historyPageSize).subscribe({
      next: (response) => {
        this.selectedUserHistory = response.content
          .filter((item) => !item.isDeleted)
          .map((item) => this.mapToHistoryItem(item));
      },
      error: () => {
        this.isLoadingSelectedHistory = false;
        this.toastService.error('Could not load message history.');
      },
      complete: () => {
        this.isLoadingSelectedHistory = false;
      },
    });
  }

  clearSelectedHistory(): void {
    this.selectedUser = null;
    this.selectedUserHistory = [];
    this.isLoadingSelectedHistory = false;
  }

  private mapToHistoryItem(item: SpamDTO): MessageHistoryItem {
    return {
      id: item.id,
      preview: item.text,
      status: item.category === 'spam' ? 'spam' : 'safe',
      confidence: this.toPercent(item.prediction),
      checkedAt: `Entry #${item.id}`,
    };
  }

  private toPercent(value: number): number {
    const normalized = value <= 1 ? value * 100 : value;
    return Math.max(0, Math.min(100, Math.round(normalized)));
  }
}
