import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Subscription, switchMap, tap, timer } from 'rxjs';
import { AuthService } from 'src/app/shared/auth.service';
import { ToastService } from 'src/app/shared/toast.service';

@Component({
  standalone: true,
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
  imports: [NgIf],
})
export class VerifyEmailComponent implements OnInit {
  isButtonDisabled: boolean = true;
  countdown: number = 0;
  private countdownSubscription: Subscription | undefined;

  constructor(private auth: AuthService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.setButtonState();
  }

  sendVerificationEmail() {
    this.auth
      .getCurrentUser()
      .then((user) => {
        if (!user) {
          this.toastService.showError(
            'Failed to send verification email: User not found'
          );
          return;
        }
        this.auth.sendEmailForVerification(user).then(() => {
          this.setButtonState();
        });
      })
      .catch((error) => {
        this.toastService.showError(
          `Failed to send verification email: ${error.message}`
        );
      });
  }

  private setButtonState(): void {
    this.isButtonDisabled = true;
    this.countdown = 3; // TODO change to 30
    this.countdownSubscription = timer(0, 1000)
      .pipe(
        tap(() => this.countdown--),
        switchMap(() => (this.countdown === 0 ? timer(0) : timer(1000)))
      )
      .subscribe(() => {
        if (this.countdown <= 0) {
          this.isButtonDisabled = false;
          this.countdownSubscription?.unsubscribe();
        }
      });
  }
}
