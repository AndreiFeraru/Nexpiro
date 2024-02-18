import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = true;

  constructor(private router: Router, private authService: AuthService) {
    this.authService.user$.subscribe((user) => {
      if (user && !this.isLoading) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnInit(): void {
    this.isLoading = false;
  }

  login() {
    if (!this.email) {
      alert('Email is empty.');
      return;
    }
    if (!this.password) {
      alert('Password is empty');
      return;
    }
    this.authService.login(this.email, this.password);
    this.email = this.password = '';
  }

  signInWithGoogle() {
    this.authService.googleSignIn();
  }
}
