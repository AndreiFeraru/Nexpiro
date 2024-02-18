import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  standalone: true,
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
})
export class VerifyEmailComponent implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    // const currentUser = this.auth.getCurrentUser();
    // if (currentUser) {
    //   this.auth.sendEmailForVerification(currentUser);
    //   // TODO add resend link button with timer to avoid spamming.
    // }
  }
}
