import { Injectable } from '@angular/core';
import { Toast, ToastType } from '../models/toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: Toast[] = [];

  constructor() {}

  show(message: string, type: ToastType) {
    const toast: Toast = { message: message, type: type };
    this.toasts.push(toast);
    setTimeout(() => this.toasts.shift(), 4000);
  }

  showInfo(message: string) {
    this.show(message, ToastType.INFO);
  }

  showSuccess(message: string) {
    this.show(message, ToastType.SUCCESS);
  }

  showWarning(message: string) {
    this.show(message, ToastType.WARNING);
  }

  showError(message: string) {
    this.show(message, ToastType.ERROR);
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
