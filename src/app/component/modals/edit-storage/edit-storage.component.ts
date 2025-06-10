import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageDetails } from 'src/app/models/storageDetails';
import { UserPermissionDetails } from 'src/app/models/userPermissionDetails';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit-storage',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-storage.component.html',
  styleUrls: ['./edit-storage.component.css'],
})
export class EditStorageComponent implements OnChanges {
  name: string | undefined;
  userPermissions: { [userId: string]: UserPermissionDetails } | undefined;

  @Input() storageSelectedForEdit: StorageDetails | undefined;

  constructor(
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !changes['storageSelectedForEdit'] ||
      !changes['storageSelectedForEdit'].currentValue
    ) {
      return;
    }
    this.storageSelectedForEdit =
      changes['storageSelectedForEdit'].currentValue;
    this.updateFormValues(this.storageSelectedForEdit);
  }

  updateFormValues(storageSelectedForEdit: StorageDetails | undefined) {
    this.name = storageSelectedForEdit?.name;
    this.userPermissions = storageSelectedForEdit?.userPermissions;
  }

  clearForm() {
    this.name = '';
    this.userPermissions = undefined;
  }

  editStorage() {
    if (!this.validateForm()) return;

    this.updateStorageSelectedForEdit();

    this.storageService
      .editStorage(this.storageSelectedForEdit!)
      .then(() => {
        this.toastService.showSuccess('Storage updated successfully');
        // this.clearForm();
        // this.storageSelectedForEdit = undefined;
      })
      .catch(() => {
        this.toastService.showError(
          `Could not update storage '${this.storageSelectedForEdit!.name}'`
        );
      });
  }

  validateForm(): boolean {
    if (!this.storageSelectedForEdit) {
      this.toastService.showError('No storage selected for edit');
      return false;
    }
    if (!this.name) {
      this.toastService.showError('Storage name is required');
      return false;
    }
    if (
      !this.userPermissions ||
      Object.keys(this.userPermissions).length === 0
    ) {
      this.toastService.showError('User permissions are required');
      return false;
    }

    return true;
  }

  updateStorageSelectedForEdit() {
    this.storageSelectedForEdit!.name = this.name!.trim();
    this.storageSelectedForEdit!.userPermissions = this.userPermissions!;
  }

  removeUserPermission(userId: string) {
    if (!this.userPermissions || !this.userPermissions[userId]) {
      this.toastService.showError('Could not remove user permission'); // TODO Fix toasts showing behind modal
      return;
    }
    if (Object.keys(this.userPermissions).length === 1) {
      this.toastService.showError(
        'Cannot remove last user permission from storage'
      );
      return;
    }
    delete this.userPermissions[userId];
  }
}
