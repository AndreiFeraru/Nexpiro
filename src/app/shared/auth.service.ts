import { Injectable, OnDestroy } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  authState,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  authState$: Observable<User | null>;

  constructor(
    private router: Router,
    private authService: Auth,
    private toastService: ToastService
  ) {
    this.authState$ = authState(authService);
  }

  ngOnDestroy() {}

  async login(email: string, password: string): Promise<void> {
    try {
      const res = await signInWithEmailAndPassword(
        this.authService,
        email,
        password
      );
      if (res.user?.emailVerified == false) {
        this.router.navigate(['/verify-email']);
      } else {
        await this.authService.setPersistence(browserLocalPersistence);
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      this.toastService.showError(
        'Login failed. Please check your username/password and try again'
      );
    }
  }

  async googleSignIn(): Promise<void> {
    try {
      await signInWithPopup(this.authService, new GoogleAuthProvider());
      await this.authService.setPersistence(browserLocalPersistence);
    } catch (error) {
      this.toastService.showError('Google sign-in failed. Please try again.');
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      const res = await createUserWithEmailAndPassword(
        this.authService,
        email,
        password
      );
      this.sendEmailForVerification(res.user);
    } catch (error) {
      this.toastService.showError('Registration failed. Please try again.');
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.authService);
      this.router.navigate(['/login']);
    } catch (error) {
      this.toastService.showError('Logout failed. Please try again.');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.authService, email);
      this.toastService.showInfo(
        'Password reset email sent. Please check your inbox.'
      );
    } catch (error) {
      this.toastService.showError(
        'Failed to send password reset email. Please try again.'
      );
    }
  }

  async sendEmailForVerification(user: User): Promise<void> {
    try {
      await sendEmailVerification(user);
      this.toastService.showSuccess(
        'Verification email sent. Please check your inbox.',
        true
      );
      this.router.navigate(['/verify-email']);
    } catch (err) {
      this.toastService.showError(
        'Failed to send verification email. Please try again.'
      );
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.authService.currentUser;
  }
}
