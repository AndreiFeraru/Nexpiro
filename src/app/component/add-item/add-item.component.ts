import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StorageItem } from 'src/app/models/storageItem';
import { AuthService } from 'src/app/shared/auth.service';
import { StorageService } from 'src/app/shared/storage.service';
import { ToastService } from 'src/app/shared/toast.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  standalone: true,
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class AddItemComponent implements OnDestroy {
  authStateSubscription: Subscription | undefined;

  name: string | undefined;
  description: string | undefined;
  expirationDate: string | undefined;
  currentUser: User | null = null;

  storageId: string = '0'; // TODO get storage id from user

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.authStateSubscription = this.authService.authState$.subscribe(
      (user) => {
        this.currentUser = user;
      }
    );
    this.clearForm();
  }

  ngOnDestroy(): void {
    this.authStateSubscription?.unsubscribe();
  }

  public clearForm() {
    this.name = '';
    this.description = '';
    this.expirationDate = new Date().toISOString().split('T')[0];
  }

  validateForm(): boolean {
    if (!this.name) {
      this.toastService.showError('Item name is required');
      return false;
    }

    if (!this.expirationDate) {
      this.toastService.showError('Expiration date is required');
      return false;
    }

    if (
      (this.currentUser?.displayName === undefined ||
        this.currentUser?.displayName === null) &&
      (this.currentUser?.email === undefined ||
        this.currentUser?.email === null)
    ) {
      this.toastService.showError(`Could not retrieve user name or email`);
      return false;
    }

    this.name = this.name.trim();
    this.description = this.description?.trim();

    return true;
  }

  addItem() {
    if (!this.validateForm()) {
      return;
    }

    const dateNow = new Date().toISOString().split('T')[0];

    const item: StorageItem = {
      id: uuidv4(),
      name: this.name!,
      description: this.description,
      expirationDate: this.expirationDate!,
      createdAt: dateNow,
      lastModified: dateNow,
      lastModifiedBy:
        this.currentUser?.displayName ?? this.currentUser?.email ?? '',
    };

    this.storageService.addItemToStorage(this.storageId, item).then(
      () => {
        this.toastService.showSuccess(`Item added successfully '${item.name}'`);
        this.clearForm();
      },
      (err) => {
        this.toastService.showError(`Error adding item '${item.name}': ${err}`);
      }
    );
  }
}
