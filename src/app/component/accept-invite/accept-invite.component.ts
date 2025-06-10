import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShareToken } from 'src/app/models/sharedToken';
import { AllFalseUerPermissionDetails } from 'src/app/models/userPermissionDetails';
import { AuthService } from 'src/app/services/auth.service';
import { ShareTokenService } from 'src/app/services/share-token.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

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
    private toastService: ToastService,
    private tokenService: ShareTokenService
  ) {}

  ngOnInit(): void {
    debugger;
    if (this.route.snapshot.url[0].path !== 'invite') {
      return;
    }
    const token = this.route.snapshot.url[1].path;
    if (!token) {
      this.toastService.showError('Token is missing');
      return;
    }
    this.tokenService
      .validateToken(token)
      .then((isValid) => {
        if (!isValid) {
          this.toastService.showError('Invalid token');
          return;
        }
        this.tokenService
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
  }

  async declineInvite() {
    this.router.navigate(['manage-storages']);
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
        this.shareToken.permissions || AllFalseUerPermissionDetails
      );
      this.toastService.showSuccess('Successfully added to storage');
      this.router.navigate(['manage-storages']);
    } catch (err) {
      this.toastService.showError(`Error adding user to storage: ${err}`);
    }
  }
}
