import { Component, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
})
export class VerifyEmailComponent implements OnInit {
  private currentUser: User | null = null;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
    });
    if (this.currentUser) {
      this.auth.sendEmailForVerification(this.currentUser);
      // TODO add resend link button with timer to avoid spamming.
    }
  }
}
