import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import {
  Auth,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private AUTH_TOKEN_KEY: string = 'AUTH_TOKEN';
  public LoggedInUserName: string | null | undefined;

  constructor(private router: Router, private auth: Auth) {}

  getCurrentUser(): Observable<User | null> {
    // TODO
    return of(null);
  }

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password).then(
      (res) => {
        localStorage.setItem(this.AUTH_TOKEN_KEY, 'true');
        if (res.user?.emailVerified == true) {
          this.router.navigate(['/dashboard']);
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

  register(email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password).then(
      (res) => {
        this.sendEmailForVerification(res.user);
        localStorage.setItem(this.AUTH_TOKEN_KEY, 'true');
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
        localStorage.removeItem(this.AUTH_TOKEN_KEY);
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

  sendEmailForVerification(user: any) {
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

  googleSignIn() {
    signInWithPopup(this.auth, new GoogleAuthProvider()).then(
      (result) => {
        localStorage.setItem(
          this.AUTH_TOKEN_KEY,
          JSON.stringify(result.user?.uid)
        );
        this.LoggedInUserName = result.user?.displayName;
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        alert('Something went wrong' + error);
      }
    );
  }
}
