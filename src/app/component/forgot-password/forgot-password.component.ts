import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [FormsModule],
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private auth: AuthService) {}

  forgotPassword() {
    this.auth.forgotPassword(this.email);
    this.email = '';
  }
}
