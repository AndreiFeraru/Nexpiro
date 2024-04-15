import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from 'src/app/shared/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.sass'],
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  removeToast(toast: any) {
    this.toastService.remove(toast);
  }
}
