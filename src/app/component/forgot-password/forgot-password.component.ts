import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/shared/auth.service';
import { ToastService } from 'src/app/shared/toast.service';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [FormsModule],
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private auth: AuthService, private toastService: ToastService) {}

  forgotPassword() {
    this.auth.forgotPassword(this.email).then(
      () => {
        this.toastService.showInfo(
          'Password reset email sent. Please check your inbox.'
        );
      },
      (err) => {
        this.toastService.showError(
          `Something went wrong while resetting password: ${err.message}`
        );
      }
    );
    this.email = '';
  }
}
