import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  public LoggedInUserName: string = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.LoggedInUserName = this.auth.LoggedInUserName ?? '';
  }

  logout() {
    this.auth.logout();
  }
}
