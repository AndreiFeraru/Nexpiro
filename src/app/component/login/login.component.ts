import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) this.router.navigate(['/dashboard']);
  }

  login() {
    if (this.email == '') {
      alert('Email is empty.');
      return;
    }
    if (this.password == '') {
      alert('Password is empty');
      return;
    }
    this.auth.login(this.email, this.password);
    this.email = this.password = '';
  }

  signInWithGoogle() {
    this.auth.googleSignIn();
  }
}
