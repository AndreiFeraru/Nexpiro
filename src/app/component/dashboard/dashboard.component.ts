import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
})
export class DashboardComponent {
  public LoggedInUser: string = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.LoggedInUser = this.auth.LoggedInUser ?? '';
  }

  logout() {
    this.auth.logout();
  }
}
