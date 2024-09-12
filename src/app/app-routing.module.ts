import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcceptInviteComponent } from './component/accept-invite/accept-invite.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './component/forgot-password/forgot-password.component';
import { LoginComponent } from './component/login/login.component';
import { ManageStoragesComponent } from './component/manage-storages/manage-storages.component';
import { RegisterComponent } from './component/register/register.component';
import { VerifyEmailComponent } from './component/verify-email/verify-email.component';
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
