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

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.authService, email, password).then(
      async (res) => {
        this.toastService.showSuccess('Logged in successfully');
        if (res.user?.emailVerified == false) {
          this.router.navigate(['/verify-email']);
        } else {
          await this.authService.setPersistence(browserLocalPersistence);
          this.router.navigate(['/dashboard']);
        }
      }
    );
  }

  async googleSignIn() {
    await signInWithPopup(this.authService, new GoogleAuthProvider()).then(
      () => {
        this.toastService.showSuccess('Logged in successfully');
        this.authService.setPersistence(browserLocalPersistence);
      }
    );
  }

  async register(email: string, password: string) {
    await createUserWithEmailAndPassword(
      this.authService,
      email,
      password
    ).then((res) => {
      this.sendEmailForVerification(res.user);
    });
  }

  async logout() {
    await signOut(this.authService).then(() => {
      this.router.navigate(['/login']);
    });
  }

  async forgotPassword(email: string) {
    sendPasswordResetEmail(this.authService, email);
  }

  private sendEmailForVerification(user: User) {
    sendEmailVerification(user).then(
      () => {
        this.router.navigate(['/verify-email']);
      },
      (err) => {
        throw `Something went wrong! Could not send email to to verify account. ${err.message}`;
      }
    );
  }
}
