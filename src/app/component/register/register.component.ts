import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {}

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
