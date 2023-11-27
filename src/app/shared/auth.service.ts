import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, FacebookAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private AUTH_TOKEN_KEY: string = 'AUTH_TOKEN';

  constructor(private fireAuth: AngularFireAuth, private router: Router) {}

  login(email: string, password: string) {
    this.fireAuth.signInWithEmailAndPassword(email, password).then(
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
    this.fireAuth.createUserWithEmailAndPassword(email, password).then(
      (res) => {
        this.sendEmailForVerification(res.user);
        localStorage.setItem(this.AUTH_TOKEN_KEY, 'true');
        this.router.navigate(['/dashboard']);
        alert('Registration successful.');
      },
      (err) => {
        alert(`Something went wrong while registering: ${err.message}`);
        this.router.navigate(['/login']);
      }
    );
  }

  logout() {
    this.fireAuth.signOut().then(
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
    this.fireAuth.sendPasswordResetEmail(email).then(
      () => {
        this.router.navigate(['/verify-email']);
      },
      (error) => {
        alert('Something went wrong!');
      }
    );
  }

  sendEmailForVerification(user: any) {
    user.sendEmailVerification().then(
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

  getCurrentUser(): Observable<firebase.default.User | null> {
    return this.fireAuth.authState;
  }

  googleSignIn() {
    this.fireAuth.signInWithPopup(new GoogleAuthProvider()).then(
      (result) => {
        localStorage.setItem(
          this.AUTH_TOKEN_KEY,
          JSON.stringify(result.user?.uid)
        );
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        alert('Something went wrong' + error);
      }
    );
  }
}
