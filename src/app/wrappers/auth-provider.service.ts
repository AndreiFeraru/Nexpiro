import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

/**
 * Abstraction layer over Firebase Auth to make testing easier
 */
@Injectable({
  providedIn: 'root',
})
export class AuthProviderService {
  constructor(private auth: Auth) {}

  getAuthState(): Observable<User | null> {
    return authState(this.auth);
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async signOut() {
    return signOut(this.auth);
  }

  async setPersistence() {
    return this.auth.setPersistence(browserLocalPersistence);
  }

  async sendPasswordResetEmail(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  async sendEmailVerification(user: User) {
    return sendEmailVerification(user);
  }

  async googleSignIn() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  get currentUser() {
    return this.auth.currentUser;
  }
}
