import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [FormsModule],
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(
    public router: Router,
    private auth: AuthService,
    private toastService: ToastService
  ) {}

  async forgotPassword() {
    if (!this.email) {
      this.toastService.showError('Email is empty');
      return;
    }
    this.auth.forgotPassword(this.email);
    this.email = '';
  }
}
