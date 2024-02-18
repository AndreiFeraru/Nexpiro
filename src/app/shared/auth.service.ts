import { Injectable } from '@angular/core';
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
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private router: Router, private auth: Auth) {
    this.user$ = authState(auth);
  }

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password).then(
      (res) => {
        if (res.user?.emailVerified == true) {
          this.router.navigate(['/dashboard']);
          localStorage.setItem('currentUser', JSON.stringify(res.user));
        } else {
          this.router.navigate(['/verify-email']);
        }
      },
      (err) => {
        alert(`Something went wrong while singing in: ${err.message}`);
        this.router.navigate(['/login']);
      }
    );
  }

  googleSignIn() {
    signInWithPopup(this.auth, new GoogleAuthProvider()).then(
      (result) => {
        localStorage.setItem('currentUser', JSON.stringify(result.user));
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
        localStorage.removeItem('currentUser');
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
      (error) => {
        alert('Something went wrong!');
      }
    );
  }

  sendEmailForVerification(user: User) {
    sendEmailVerification(user).then(
      (res: any) => {
        this.router.navigate(['/verify-email']);
      },
      (error: any) => {
        alert(
          'Something went wrong! Could not send email to to verify account.'
        );
      }
    );
  }
}
