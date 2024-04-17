import { Component } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/auth.service';
import { ToastService } from 'src/app/shared/toast.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  authStateSubscription: Subscription | null = null;
  currentUser: User | null = null;
  public LoggedInUserName: string = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.authStateSubscription = this.authService.authState$.subscribe(
      (user) => {
        this.currentUser = user;
        this.LoggedInUserName = user?.displayName ?? user?.email ?? '';
      }
    );
  }

  logout() {
    this.authService.logout().catch((err) => {
      this.toastService.showError(`Logout failed: ${err.message}`);
    });
  }

  ngOnDestroy() {
    this.authStateSubscription?.unsubscribe();
  }
}
