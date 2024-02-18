import { Component } from '@angular/core';
import { User } from '@angular/fire/auth';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  currentUser: User | null = null;
  public LoggedInUserName: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.currentUser = user;
      this.LoggedInUserName = user?.displayName ?? user?.email ?? '';
    });
  }

  logout() {
    this.authService.logout();
  }
}
