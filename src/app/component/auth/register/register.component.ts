import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
    public router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  async register() {
    if (this.email == '') {
      this.toastService.showError('Email is empty');
      return;
    }
    if (this.password == '') {
      this.toastService.showError('Password is empty');
      return;
    }
    await this.authService.register(this.email, this.password);
    this.clearForm();
  }

  clearForm() {
    this.email = this.password = '';
  }
}
