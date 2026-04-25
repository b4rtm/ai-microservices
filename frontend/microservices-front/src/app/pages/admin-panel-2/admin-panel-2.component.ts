import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { HistoryService } from '../../services/history.service';
import { SpamDTO } from '../../Interfaces/SpamInterfaces';
import { ToastService } from '../../services/toast.service';
import { UserDto } from '../../Interfaces/AdminInterfaces';
import {
  MessageHistoryComponent,
  MessageHistoryItem,
} from '../../components/message-history/message-history.component';

interface AdminUser {
  id: number;
  email: string;
  role: string;
  archived: boolean;
}

type ConfirmActionType = 'archive' | 'delete' | 'role';

interface ConfirmDialogState {
  isOpen: boolean;
  action: ConfirmActionType | null;
  user: AdminUser | null;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [FormsModule, MessageHistoryComponent],
  templateUrl: './admin-panel-2.component.html',
  styleUrl: './admin-panel-2.component.scss',
})
export class AdminPanel2Component implements OnInit, OnDestroy {
  users: AdminUser[] = [];
  totalUsers = 0;
  currentPage = 0;
  totalPages = 0;
  readonly pageSize = 10;
  isLoadingUsers = false;
  emailSearch = '';
  selectedUser: AdminUser | null = null;
  selectedUserHistory: MessageHistoryItem[] = [];
  isLoadingSelectedHistory = false;
  archivingUserIds = new Set<number>();
  deletingUserIds = new Set<number>();
  roleChangingUserIds = new Set<number>();
  confirmDialog: ConfirmDialogState = {
    isOpen: false,
    action: null,
    user: null,
  };
  private readonly historyPageSize = 25;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private historyService: HistoryService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadUsers(0);
  }

  ngOnDestroy(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  }

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

  handleHistoryClosed(): void {
    this.clearSelectedHistory();
  }

  onEmailSearchChanged(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.loadUsers(0);
    }, 300);
  }

  clearEmailSearch(): void {
    this.emailSearch = '';
    this.loadUsers(0);
  }

  goToPreviousPage(): void {
    if (this.currentPage <= 0 || this.isLoadingUsers) {
      return;
    }

    this.loadUsers(this.currentPage - 1);
  }

  goToNextPage(): void {
    if (this.currentPage >= this.totalPages - 1 || this.isLoadingUsers) {
      return;
    }

    this.loadUsers(this.currentPage + 1);
  }

  requestToggleArchive(user: AdminUser): void {
    if (this.archivingUserIds.has(user.id)) {
      return;
    }

    this.confirmDialog = {
      isOpen: true,
      action: 'archive',
      user,
    };
  }

  requestDeleteUser(user: AdminUser): void {
    if (this.deletingUserIds.has(user.id)) {
      return;
    }

    this.confirmDialog = {
      isOpen: true,
      action: 'delete',
      user,
    };
  }

  requestToggleRole(user: AdminUser): void {
    if (this.roleChangingUserIds.has(user.id)) {
      return;
    }

    this.confirmDialog = {
      isOpen: true,
      action: 'role',
      user,
    };
  }

  closeConfirmDialog(): void {
    this.confirmDialog = {
      isOpen: false,
      action: null,
      user: null,
    };
  }

  confirmDialogAction(): void {
    if (!this.confirmDialog.user || !this.confirmDialog.action) {
      return;
    }

    if (this.confirmDialog.action === 'archive') {
      this.toggleArchive(this.confirmDialog.user);
    } else if (this.confirmDialog.action === 'delete') {
      this.deleteUser(this.confirmDialog.user);
    } else {
      this.toggleRole(this.confirmDialog.user);
    }

    this.closeConfirmDialog();
  }

  get confirmDialogTitle(): string {
    if (this.confirmDialog.action === 'archive') {
      return this.confirmDialog.user?.archived ? 'Restore User' : 'Archive User';
    }

    if (this.confirmDialog.action === 'role') {
      return this.isAdminRole(this.confirmDialog.user?.role ?? '')
        ? 'Change Role to User'
        : 'Change Role to ADMIN';
    }

    return 'Delete User';
  }

  get confirmDialogMessage(): string {
    const email = this.confirmDialog.user?.email ?? 'this user';

    if (this.confirmDialog.action === 'archive') {
      return this.confirmDialog.user?.archived
        ? `Are you sure you want to restore ${email}?`
        : `Are you sure you want to archive ${email}?`;
    }

    if (this.confirmDialog.action === 'role') {
      return this.isAdminRole(this.confirmDialog.user?.role ?? '')
        ? `Are you sure you want to change ${email}'s role to user?`
        : `Are you sure you want to change ${email}'s role to ADMIN?`;
    }

    return `Are you sure you want to permanently delete ${email}? This action cannot be undone.`;
  }

  get confirmButtonLabel(): string {
    if (this.confirmDialog.action === 'archive') {
      return this.confirmDialog.user?.archived ? 'Restore user' : 'Archive user';
    }

    if (this.confirmDialog.action === 'role') {
      return this.isAdminRole(this.confirmDialog.user?.role ?? '')
        ? 'Change to user'
        : 'Change to ADMIN';
    }

    return 'Delete user';
  }

  get isConfirmInProgress(): boolean {
    const user = this.confirmDialog.user;
    if (!user || !this.confirmDialog.action) {
      return false;
    }

    if (this.confirmDialog.action === 'archive') {
      return this.archivingUserIds.has(user.id);
    }

    if (this.confirmDialog.action === 'delete') {
      return this.deletingUserIds.has(user.id);
    }

    return this.roleChangingUserIds.has(user.id);
  }

  isAdminRole(role: string): boolean {
    return role.trim().toUpperCase() === 'ADMIN';
  }

  toggleRole(user: AdminUser): void {
    if (this.roleChangingUserIds.has(user.id)) {
      return;
    }

    this.roleChangingUserIds.add(user.id);

    this.adminService.toggleUserRole(user.id).subscribe({
      next: () => {
        const nextRole = this.isAdminRole(user.role) ? 'user' : 'ADMIN';
        user.role = nextRole;

        if (this.selectedUser?.id === user.id) {
          this.selectedUser.role = nextRole;
        }

        this.toastService.success(`Role changed to ${nextRole}.`);
      },
      error: () => {
        this.toastService.error('Could not update user role.');
      },
      complete: () => {
        this.roleChangingUserIds.delete(user.id);
      },
    });
  }

  toggleArchive(user: AdminUser): void {
    if (this.archivingUserIds.has(user.id)) {
      return;
    }

    this.archivingUserIds.add(user.id);

    this.adminService.toggleArchiveUser(user.id).subscribe({
      next: () => {
        user.archived = !user.archived;

        if (this.selectedUser?.id === user.id) {
          this.selectedUser.archived = user.archived;
        }

        this.toastService.success(
          user.archived ? 'User archived successfully.' : 'User restored successfully.',
        );
      },
      error: () => {
        this.toastService.error('Could not update user archive status.');
      },
      complete: () => {
        this.archivingUserIds.delete(user.id);
      },
    });
  }

  deleteUser(user: AdminUser): void {
    if (this.deletingUserIds.has(user.id)) {
      return;
    }

    this.deletingUserIds.add(user.id);

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        const remainingOnPage = this.users.filter((item) => item.id !== user.id).length;
        const targetPage = remainingOnPage === 0 && this.currentPage > 0 ? this.currentPage - 1 : this.currentPage;

        if (this.selectedUser?.id === user.id) {
          this.clearSelectedHistory();
        }

        this.toastService.success('User deleted successfully.');
        this.loadUsers(targetPage);
      },
      error: () => {
        this.toastService.error('Could not delete user.');
      },
      complete: () => {
        this.deletingUserIds.delete(user.id);
      },
    });
  }

  private mapToHistoryItem(item: SpamDTO): MessageHistoryItem {
    const confidence = this.toPercent(item.prediction);

    return {
      id: item.id,
      preview: item.text,
      status: this.getStatusByPercent(confidence),
      confidence,
      checkedAt: `Entry #${item.id}`,
    };
  }

  private getStatusByPercent(percent: number): MessageHistoryItem['status'] {
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

  private loadUsers(page: number): void {
    this.isLoadingUsers = true;

    this.adminService.getAllUsers(page, this.pageSize, this.emailSearch).subscribe({
      next: (response) => {
        this.users = response.content.map((user) => this.mapToAdminUser(user));
        this.totalUsers = response.totalElements;
        this.totalPages = this.toNonNegativeInteger(response.totalPages, 0);

        const backendPageIndex =
          response.number !== undefined ? response.number : response.page !== undefined ? response.page : page;

        this.currentPage = this.toNonNegativeInteger(backendPageIndex, page);
      },
      error: () => {
        this.users = [];
        this.totalUsers = 0;
        this.totalPages = 0;
        this.currentPage = 0;
        this.toastService.error('Could not load users.');
      },
      complete: () => {
        this.isLoadingUsers = false;
      },
    });
  }

  private mapToAdminUser(user: UserDto): AdminUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      archived: user.archived,
    };
  }

  private toNonNegativeInteger(value: unknown, fallback: number): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
      return fallback;
    }

    return Math.floor(parsed);
  }
}
