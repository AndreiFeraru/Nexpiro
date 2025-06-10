import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule],
})
export class LoginComponent implements OnDestroy {
  email: string = '';
  password: string = '';

  authStateSubscription: Subscription;

  constructor(
    public router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.authStateSubscription = authService.authState$.subscribe((user) => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }

  async login() {
    if (!this.email) {
      this.toastService.showError('Email is empty');
      return;
    }
    if (!this.password) {
      this.toastService.showError('Password is empty');
      return;
    }

    await this.authService.login(this.email, this.password);

    this.clearForm();
  }

  async signInWithGoogle() {
    await this.authService.googleSignIn();
  }

  clearForm() {
    this.email = this.password = '';
  }
}
