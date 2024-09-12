import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from 'src/app/shared/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent {
  constructor(public toastService: ToastService) {
    console.log(this.toastService.toasts);
  }
}
