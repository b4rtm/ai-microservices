import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
  autohide?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  success(message: string, title?: string, duration = 4000) {
    return this.show({ type: 'success', message, title, duration });
  }

  error(message: string, title?: string, duration = 6000) {
    return this.show({ type: 'error', message, title, duration });
  }

  info(message: string, title?: string, duration = 4000) {
    return this.show({ type: 'info', message, title, duration });
  }

  warning(message: string, title?: string, duration = 5000) {
    return this.show({ type: 'warning', message, title, duration });
  }

  show(input: { type: ToastType; message: string; title?: string; duration?: number; autohide?: boolean }) {
    const id = this.generateId();
    const toast: Toast = {
      id,
      type: input.type,
      message: input.message,
      title: input.title,
      duration: Math.max(0, input.duration ?? 4000),
      autohide: input.autohide ?? true,
    };

    const list = this.toastsSubject.value;
    this.toastsSubject.next([...list, toast]);

    if (toast.autohide && toast.duration > 0 && isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.remove(id), toast.duration);
    }

    return id;
  }

  remove(id: string) {
    const next = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(next);
  }

  clear() {
    this.toastsSubject.next([]);
  }

  private generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }
}