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

@Component({
  selector: 'app-manage-storages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-storages.component.html',
  styleUrls: ['./manage-storages.component.css'],
})
export class ManageStoragesComponent {
  authStateSubscription: Subscription | undefined;

  storages: Storage[] | undefined;
  newStorageName: string | undefined;
  loggedInUserId: string | undefined;
  loggedInUserName: string | null = null;

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

    // create userpermission
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
  }

  getUserIdsString(permissions: UserPermission[]) {
    if (!permissions || permissions.length === 0) {
      return '';
    }
    return permissions.map((permission) => permission.userId).join(', ');
  }

  currentUserCanEdit(storage: Storage): boolean {
    if (!storage.userPermissions) {
      return false;
    }
    const userPermission = storage.userPermissions.find(
      (permission) => permission.userId === this.loggedInUserId
    );
    return !!userPermission?.canManageStorage;
  }

  shareStorage(storageId: string, storageName: string) {
    const token = uuidv4();
    const expirationDate = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

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
        const link = `${window.location.origin}/accept-invite?token=${shareToken.token}`;
        const message = `Storage shared: ${link}`;
        console.log(message);
        this.toastService.showSuccess(message);
        // TODO Add copy button to toast
      })
      .catch((err) => {
        this.toastService.showError(`Could not share storage: ${err}`);
      });
  }
}
