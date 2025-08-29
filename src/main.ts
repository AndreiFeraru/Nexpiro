import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import {
  connectDatabaseEmulator,
  getDatabase,
  provideDatabase,
} from '@angular/fire/database';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';

import { AcceptInviteComponent } from './app/component/accept-invite/accept-invite.component';
import { ForgotPasswordComponent } from './app/component/auth/forgot-password/forgot-password.component';
import { LoginComponent } from './app/component/auth/login/login.component';
import { RegisterComponent } from './app/component/auth/register/register.component';
import { VerifyEmailComponent } from './app/component/auth/verify-email/verify-email.component';
import { DashboardComponent } from './app/component/dashboard/dashboard.component';
import { ManageStoragesComponent } from './app/component/manage-storages/manage-storages.component';
import { ViewStorageComponent } from './app/component/view-storage/view-storage.component';
import { environment } from './environments/environment';

// Define routes directly
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'manage-storages', component: ManageStoragesComponent },
  { path: 'view-storage', component: ViewStorageComponent },
  { path: 'invite/:token', component: AcceptInviteComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => {
      const auth = getAuth();
      if (!environment.production) {
        connectAuthEmulator(auth, 'http://localhost:9099', {
          disableWarnings: true,
        });
      }
      return auth;
    }),
    provideDatabase(() => {
      const db = getDatabase();
      if (!environment.production) {
        connectDatabaseEmulator(db, '127.0.0.1', 9000);
      }
      return db;
    }),
  ],
});
