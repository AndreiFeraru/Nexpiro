import { Injectable, OnDestroy } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  authState,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  browserLocalPersistence,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  authState$: Observable<User | null>;
  authStateSubscription: Subscription;

  constructor(
    private router: Router,
    private authService: Auth,
    private toastService: ToastService
  ) {
    this.authState$ = authState(authService);
    this.authStateSubscription = this.authState$.subscribe(
      (aUser: User | null) => {
        //handle auth state changes here. Note, that user will be null if there is no currently logged in user.
      }
    );
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.authService, email, password).then(
      async (res) => {
        if (res.user?.emailVerified == false) {
          this.router.navigate(['/verify-email']);
        } else {
          await this.authService.setPersistence(browserLocalPersistence);
          this.router.navigate(['/dashboard']);
        }
      },
      (err) => {
        this.toastService.showError(
          `Something went wrong while singing in: ${err.message}`
        );
      }
    );
  }

  googleSignIn() {
    signInWithPopup(this.authService, new GoogleAuthProvider()).then(
      async () => {
        await this.authService.setPersistence(browserLocalPersistence);
        this.router.navigate(['/dashboard']);
      },
      (err) => {
        this.toastService.showError(
          `Something went wrong while signing in with Google: ${err.message}`
        );
      }
    );
  }

  register(email: string, password: string) {
    createUserWithEmailAndPassword(this.authService, email, password).then(
      (res) => {
        this.sendEmailForVerification(res.user);
        this.toastService.showSuccess(
          'Registration successful. Please check your email to verify your account.'
        );
      },
      (err) => {
        this.toastService.showError(
          `Something went wrong while registering: ${err.message}`
        );
      }
    );
  }

  logout() {
    signOut(this.authService).then(
      () => {
        this.router.navigate(['/login']);
      },
      (err) => {
        alert(`Something went wrong while signing out: ${err.message}`);
      }
    );
  }

  forgotPassword(email: string) {
    sendPasswordResetEmail(this.authService, email).then(
      () => {
        this.router.navigate(['/verify-email']);
      },
      (err) => {
        alert('Something went wrong!');
      }
    );
  }

  sendEmailForVerification(user: User) {
    sendEmailVerification(user).then(
      (res: any) => {
        this.router.navigate(['/verify-email']);
      },
      (err: any) => {
        alert(
          'Something went wrong! Could not send email to to verify account.'
        );
      }
    );
  }
}
