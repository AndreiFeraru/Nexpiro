import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShareToken } from 'src/app/models/sharedToken';
import { AuthService } from 'src/app/shared/auth.service';
import { StorageService } from 'src/app/shared/storage.service';
import { ToastService } from 'src/app/shared/toast.service';

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accept-invite.component.html',
  styleUrls: ['./accept-invite.component.css'],
})
export class AcceptInviteComponent {
  public shareToken: ShareToken | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.url[0].path !== 'accept-invite') {
      return;
    }

    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (!token) {
        this.toastService.showError('Token is missing');
        return;
      }
      this.storageService
        .validateToken(token)
        .then((isValid) => {
          if (!isValid) {
            this.toastService.showError('Invalid token');
            return;
          }
          this.storageService
            .getShareTokenByToken(token)
            .then((shareToken) => {
              this.shareToken = shareToken;
            })
            .catch((err) => {
              this.toastService.showError(`Error getting share token: ${err}`);
            });
        })
        .catch((err) => {
          this.toastService.showError(`Error validating token: ${err}`);
        });
    });
  }

  acceptInviteOnClick(): void {
    this.acceptInvite();
  }

  async acceptInvite() {
    if (!this.shareToken?.storageId) {
      this.toastService.showError('Storage id is missing');
      return;
    }

    try {
      const user = await this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not found');
      }
      await this.storageService.addUserToStorage(
        this.shareToken.storageId,
        user.uid,
        user.displayName ?? user.email ?? 'Unknown User'
      );
      this.toastService.showSuccess('Successfully added to storage');
      this.router.navigate(['manage-storages']);
    } catch (err) {
      this.toastService.showError(`Error adding user to storage: ${err}`);
    }
  }
}
