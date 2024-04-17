import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/auth.service';
import { ToastService } from 'src/app/shared/toast.service';

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
    private router: Router,
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

  login() {
    if (!this.email) {
      this.toastService.showError('Email is empty');
      return;
    }
    if (!this.password) {
      this.toastService.showError('Password is empty');
      return;
    }
    this.authService.login(this.email, this.password).catch((err) => {
      `Something went wrong while singing in: ${err.message}`;
    });
    this.clearForm();
  }

  signInWithGoogle() {
    this.authService.googleSignIn().catch((err) => {
      `Something went wrong while signing in with Google: ${err.message}`;
    });
  }

  clearForm() {
    this.email = this.password = '';
  }
}
