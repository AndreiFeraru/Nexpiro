import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StorageItem } from 'src/app/models/storageItem';
import { AuthService } from 'src/app/services/auth.service';
import { StorageItemService } from 'src/app/services/storageItem.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.css'],
  imports: [FormsModule],
})
export class EditItemComponent implements OnChanges {
  name: string | undefined;
  description: string | undefined;
  expirationDate: string | undefined;

  @Input() itemSelectedForEdit: StorageItem | undefined;
  @Input() selectedStorageId: string | undefined;

  constructor(
    private storageItemService: StorageItemService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  authStateSubscription: Subscription | undefined;
  currentUser: User | null = null;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !changes['itemSelectedForEdit'] ||
      !changes['itemSelectedForEdit'].currentValue
    ) {
      return;
    }
    this.itemSelectedForEdit = changes['itemSelectedForEdit'].currentValue;
    this.updateFormValues(this.itemSelectedForEdit);
  }

  clearForm() {
    this.name = '';
    this.description = '';
    this.expirationDate = new Date().toISOString().split('T')[0];
  }

  updateFormValues(itemSelectedForEdit: StorageItem | undefined) {
    this.name = itemSelectedForEdit?.name;
    this.description = itemSelectedForEdit?.description;
    this.expirationDate = itemSelectedForEdit?.expirationDate;
  }

  editItem() {
    if (!this.validateForm()) return;

    this.updateSelectedForEdit();

    this.storageItemService
      .updateItemInStorage(this.selectedStorageId!, this.itemSelectedForEdit!)
      .then(
        () => {
          this.toastService.showSuccess(
            `Item updated successfully '${this.itemSelectedForEdit!.name}'`
          );
          this.clearForm();
          this.itemSelectedForEdit = undefined;
        },
        () => {
          this.toastService.showError(
            `Error updating item '${this.itemSelectedForEdit!.name}'`
          );
        }
      );
  }

  validateForm(): boolean {
    if (this.selectedStorageId === undefined) {
      this.toastService.showError('No storage selected');
      return false;
    }
    if (!this.itemSelectedForEdit) {
      this.toastService.showError('No item selected for edit');
      return false;
    }
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
      this.toastService.showError(
        `Could not retrieve current user name or email`
      );
      return false;
    }
    return true;
  }

  updateSelectedForEdit() {
    if (!this.itemSelectedForEdit) return;

    this.itemSelectedForEdit.name = this.name!.trim();
    this.itemSelectedForEdit.description = this.description!.trim();
    this.itemSelectedForEdit.expirationDate = this.expirationDate!;

    const dateNow = new Date().toISOString();
    this.itemSelectedForEdit.lastModified = dateNow;
    this.itemSelectedForEdit.lastModifiedBy =
      this.currentUser?.displayName ?? this.currentUser?.email ?? ''; // TODO change this to uid and retrieve user name from user service
  }
}
