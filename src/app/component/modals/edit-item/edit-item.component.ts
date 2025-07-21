import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
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
  @ViewChild('edit_item_modal') editItemModal!: ElementRef;

  @Input() itemSelectedForEdit: StorageItem | undefined;
  @Input() selectedStorageId: string | undefined;
  @Input() parentButtonPosition: { x: string; y: string } | undefined;

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

  ngAfterViewInit() {
    if (this.editItemModal) {
      this.editItemModal.nativeElement.addEventListener('cancel', () =>
        this.editItemModal.nativeElement.close()
      );

      // Set transform origin before each open
      this.editItemModal.nativeElement.addEventListener('beforeshow', () => {
        const positionString = localStorage.getItem('editButtonPosition');
        if (positionString) {
          const position = JSON.parse(positionString);
          this.editItemModal.nativeElement.style.setProperty(
            '--origin-x',
            `${position.x}px`
          );
          this.editItemModal.nativeElement.style.setProperty(
            '--origin-y',
            `${position.y}px`
          );
        }
      });
    }
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
    this.name = this.itemSelectedForEdit?.name;
    this.description = this.itemSelectedForEdit?.description;
    this.expirationDate = this.itemSelectedForEdit?.expirationDate;
  }

  clearForm() {
    this.name = '';
    this.description = '';
    this.expirationDate = new Date().toISOString().split('T')[0];
  }

  editItem() {
    if (!this.validateForm()) return;

    this.updateItemSelectedForEdit();

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
    if (!this.currentUser?.displayName && !this.currentUser?.email) {
      this.toastService.showError(
        `Could not retrieve current user name or email`
      );
      return false;
    }
    return true;
  }

  updateItemSelectedForEdit() {
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
