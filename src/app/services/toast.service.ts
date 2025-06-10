import { Injectable } from '@angular/core';
import { Toast, ToastType } from '../models/toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: Toast[] = [];
  stickyToasts: Toast[] = [];

  private readonly DEFAULT_TOAST_TIME: number = 4000;

  constructor() {}

  show(message: string, type: ToastType, isSticky: boolean = false) {
    const toast: Toast = { message: message, type: type, isSticky: isSticky };
    if (toast.isSticky) {
      this.stickyToasts.push(toast);
      return;
    }

    this.toasts.push(toast);
    setTimeout(() => {
      this.toasts.shift();
    }, this.DEFAULT_TOAST_TIME);
  }

  showInfo(message: string, isSticky: boolean = false) {
    this.show(message, ToastType.INFO, isSticky);
  }

  showSuccess(message: string, isSticky: boolean = false) {
    this.show(message, ToastType.SUCCESS, isSticky);
  }

  showWarning(message: string, isSticky: boolean = false) {
    this.show(message, ToastType.WARNING, isSticky);
  }

  showError(message: string, isSticky: boolean = false) {
    this.show(message, ToastType.ERROR, isSticky);
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  removeSticky(toast: any) {
    this.stickyToasts = this.stickyToasts.filter((t) => t !== toast);
  }
}
