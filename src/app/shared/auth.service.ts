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

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  authState$: Observable<User | null>;
  authStateSubscription: Subscription;

  constructor(private router: Router, private auth: Auth) {
    this.authState$ = authState(auth);
    this.authStateSubscription = this.authState$.subscribe(
      (aUser: User | null) => {
        //handle auth state changes here. Note, that user will be null if there is no currently logged in user.
        console.log(aUser);
      }
    );
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password).then(
      async (res) => {
        if (res.user?.emailVerified == false) {
          this.router.navigate(['/verify-email']);
        } else {
          await this.auth.setPersistence(browserLocalPersistence);
          this.router.navigate(['/dashboard']);
        }
      },
      (err) => {
        alert(`Something went wrong while singing in: ${err.message}`);
        this.router.navigate(['/login']); // TODO Remove?
      }
    );
  }

  googleSignIn() {
    signInWithPopup(this.auth, new GoogleAuthProvider()).then(
      async (result) => {
        await this.auth.setPersistence(browserLocalPersistence);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        alert('Something went wrong' + error);
      }
    );
  }

  register(email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password).then(
      (res) => {
        this.sendEmailForVerification(res.user);
        alert('Registration successful.');
      },
      (err) => {
        alert(`Something went wrong while registering: ${err.message}`);
        this.router.navigate(['/login']);
      }
    );
  }

  logout() {
    signOut(this.auth).then(
      () => {
        this.router.navigate(['/login']);
      },
      (err) => {
        alert(`Something went wrong while signing out: ${err.message}`);
      }
    );
  }

  forgotPassword(email: string) {
    sendPasswordResetEmail(this.auth, email).then(
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
