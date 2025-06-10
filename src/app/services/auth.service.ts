import { Injectable, OnDestroy } from '@angular/core';
import { User, sendEmailVerification } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthProviderService } from '../wrappers/auth-provider.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  authState$: Observable<User | null>;

  constructor(
    private router: Router,
    private authProviderService: AuthProviderService,
    private toastService: ToastService
  ) {
    this.authState$ = this.authProviderService.getAuthState();
  }

  ngOnDestroy() {}

  async login(email: string, password: string): Promise<void> {
    try {
      const res = await this.authProviderService.signInWithEmailAndPassword(
        email,
        password
      );
      if (res.user?.emailVerified == false) {
        this.router.navigate(['/verify-email']);
      } else {
        await this.authProviderService.setPersistence();
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
      await this.authProviderService.googleSignIn();
      // Todo - check if user is verified? (not sure if this is needed for google sign in)
      await this.authProviderService.setPersistence();
    } catch (error) {
      this.toastService.showError('Google sign-in failed. Please try again.');
      console.error('Google sign-in error:', error);
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      const res = await this.authProviderService.createUserWithEmailAndPassword(
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
      await this.authProviderService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      this.toastService.showError('Logout failed. Please try again.');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await this.authProviderService.sendPasswordResetEmail(email);
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
    return this.authProviderService.currentUser;
  }

  async getUserNameFromId(userId: string) {}
}
