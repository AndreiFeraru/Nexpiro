import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/shared/auth.service';
import { ToastService } from 'src/app/shared/toast.service';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  register() {
    if (this.email == '') {
      this.toastService.showError('Email is empty');
      return;
    }
    if (this.password == '') {
      this.toastService.showError('Password is empty');
      return;
    }
    this.authService.register(this.email, this.password).then(
      () => {
        this.toastService.showSuccess(
          'Registration successful. Please check your email to verify your account.'
        );
      },
      (err) => {
        this.toastService.showError(`Registration failed: ${err.message}`);
      }
    );
    this.clearForm();
  }

  clearForm() {
    this.email = this.password = '';
  }
}
