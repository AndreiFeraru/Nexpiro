import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcceptInviteComponent } from './component/accept-invite/accept-invite.component';
import { ForgotPasswordComponent } from './component/auth/forgot-password/forgot-password.component';
import { LoginComponent } from './component/auth/login/login.component';
import { RegisterComponent } from './component/auth/register/register.component';
import { VerifyEmailComponent } from './component/auth/verify-email/verify-email.component';
import { CameraComponent } from './component/camera/camera.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { ManageStoragesComponent } from './component/manage-storages/manage-storages.component';
import { ViewStorageComponent } from './component/view-storage/view-storage.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'manage-storages', component: ManageStoragesComponent },
  { path: 'view-storage', component: ViewStorageComponent },
  { path: 'camera', component: CameraComponent },
  { path: 'invite/:token', component: AcceptInviteComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
