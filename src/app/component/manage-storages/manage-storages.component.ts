import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ShareToken } from 'src/app/models/sharedToken';
import { Storage } from 'src/app/models/storage';
import { v4 as uuidv4 } from 'uuid';
import { UserPermission } from '../../models/userPermission';
import { AuthService } from '../../shared/auth.service';
import { StorageService } from '../../shared/storage.service';
import { ToastService } from '../../shared/toast.service';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';

@Component({
  selector: 'app-manage-storages',
  standalone: true,
  imports: [CommonModule, FormsModule, DeleteModalComponent],
  templateUrl: './manage-storages.component.html',
  styleUrls: ['./manage-storages.component.css'],
})
export class ManageStoragesComponent {
  authStateSubscription: Subscription | undefined;

  storages: Storage[] | undefined;
  newStorageName: string | undefined;
  loggedInUserId: string | undefined;
  loggedInUserName: string | null = null;

  storageSelectedForDelete: Storage | undefined;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.authStateSubscription = this.authService.authState$.subscribe({
      next: (user) => {
        if (!user) {
          this.toastService.showError('User not found');
          return;
        }
        this.loggedInUserId = user.uid;
        this.loggedInUserName = user.displayName ?? user.email;

        if (this.loggedInUserId)
          this.loadStorages(this.loggedInUserId).then(() => {});
      },
      error: (err) => {
        this.toastService.showError(`Something went wrong ${err}`);
      },
    });
  }

  async loadStorages(userId: string): Promise<void> {
    try {
      const storages = await this.storageService.getStoragesForUser(userId);
      this.storages = storages;
    } catch (err) {
      this.toastService.showError(`Could not load storages ${err}`);
    }
  }

  ngOnDestroy(): void {
    this.authStateSubscription?.unsubscribe();
  }

  addStorage() {
    if (!this.loggedInUserId) {
      this.toastService.showError('Could not add storage');
      return;
    }

    if (!this.newStorageName || this.newStorageName.trim() === '') {
      this.toastService.showError('Storage name is required');
      return;
    }

    const userPermission: UserPermission = {
      userId: this.loggedInUserId,
      userName: this.loggedInUserName ?? 'Unknown User',
      canManageStorage: true,
      canCreateItems: true,
      canDeleteItems: true,
      canReadItems: true,
      canUpdateItems: true,
    };

    const newStorage: Storage = {
      id: uuidv4(),
      name: this.newStorageName.trim(),
      createdAt: new Date().toISOString(),
      userPermissions: [userPermission],
    };

    this.storageService
      .addStorage(newStorage)
      .then(() => {
        this.loadStorages(this.loggedInUserId!);
        this.toastService.showSuccess('Storage added');
      })
      .catch((err) => {
        this.toastService.showError(`Could not add storage ${err}`);
      });

    this.newStorageName = '';
  }

  getUserIdsString(permissions: UserPermission[]) {
    if (!permissions || permissions.length === 0) {
      return '';
    }
    return permissions.map((permission) => permission.userId).join(', ');
  }

  currentUserCanManageStorage(storage: Storage): boolean {
    if (!storage.userPermissions) {
      return false;
    }
    const userPermission = storage.userPermissions.find(
      (permission) => permission.userId === this.loggedInUserId
    );
    return !!userPermission?.canManageStorage;
  }

  async shareStorage(storageId: string, storageName: string) {
    const token = await this.generateShortCode(8);
    const expirationDate = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    // TODO: Add permissions to the token
    const shareToken: ShareToken = {
      token: token,
      expirationDate: expirationDate.toString(),
      createdAt: Date.now().toString(),
      storageId: storageId,
      storageName: storageName,
      sharedByUserName: this.loggedInUserName ?? 'Unknown User',
    };

    this.storageService
      .addShareToken(shareToken)
      .then(() => {
        const link = `${window.location.origin}/invite/${shareToken.token}`;
        if (navigator.share) {
          navigator
            .share({
              title: 'Check out this shared storage',
              text: 'Here is the link to the shared storage:',
              url: link,
            })
            .then(() => this.toastService.showSuccess('Successfully shared'));
        } else {
          const message = `Send this link to your friend: ${link}`;
          this.toastService.showSuccess(message, true);
        }
      })
      .catch((err) => {
        this.toastService.showError(`Could not share storage: ${err}`);
      });
  }

  private async generateShortCode(length: number): Promise<string> {
    const allowedCharacters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let result: string;

    do {
      result = Array.from({ length }, () =>
        allowedCharacters.charAt(
          Math.floor(Math.random() * allowedCharacters.length)
        )
      ).join('');
    } while (await this.storageService.tokenExists(result));

    return result;
  }

  getDateFormatted(dateString: string) {
    return dateString.split('T')[0];
  }

  onDeleteItemClicked(item: Storage) {
    this.storageSelectedForDelete = item;
  }

  onConfirmDelete() {
    if (!this.loggedInUserId) {
      this.toastService.showError('User not found');
      return;
    }
    if (!this.storageSelectedForDelete?.id) {
      this.toastService.showError('Storage id is missing');
      return;
    }
    this.storageService
      .deleteStorage(this.storageSelectedForDelete.id, this.loggedInUserId)
      .then(() => {
        this.loadStorages(this.loggedInUserId!);
        this.toastService.showSuccess('Storage deleted');
      })
      .catch((err) => {
        this.toastService.showError(`Could not delete storage: ${err}`);
      });
  }
}
