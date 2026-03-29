import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  readonly toasts$: Observable<Toast[]>;

  constructor(private readonly toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  dismiss(id: string): void {
    this.toastService.remove(id);
  }

  trackByToastId(_index: number, toast: Toast): string {
    return toast.id;
  }
}
