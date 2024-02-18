import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';

  constructor(private auth: AuthService) {}

  register() {
    if (this.email == '') {
      alert('Email is empty.');
      return;
    }
    if (this.password == '') {
      alert('Password is empty');
      return;
    }
    this.auth.register(this.email, this.password);
    this.email = this.password = '';
  }
}
