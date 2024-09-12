import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcceptInviteComponent } from './component/accept-invite/accept-invite.component';
import { ForgotPasswordComponent } from './component/auth/forgot-password/forgot-password.component';
import { LoginComponent } from './component/auth/login/login.component';
import { RegisterComponent } from './component/auth/register/register.component';
import { VerifyEmailComponent } from './component/auth/verify-email/verify-email.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { ManageStoragesComponent } from './component/manage-storages/manage-storages.component';
import { ViewStorageComponent } from './component/view-storage/view-storage.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'manage-storages', component: ManageStoragesComponent },
  { path: 'accept-invite', component: AcceptInviteComponent },
  { path: 'view-storage', component: ViewStorageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
