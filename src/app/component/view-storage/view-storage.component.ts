import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { AddItemComponent } from 'src/app/component/add-item/add-item.component';
import { EditItemComponent } from 'src/app/component/edit-item/edit-item.component';
import { StorageItem } from 'src/app/models/storageItem';
import { StorageService } from 'src/app/shared/storage.service';
import { ToastService } from 'src/app/shared/toast.service';

@Component({
  standalone: true,
  selector: 'app-view-storage',
  templateUrl: 'view-storage.component.html',
  styleUrls: ['view-storage.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AddItemComponent,
    EditItemComponent,
  ],
})
export class ViewStorageComponent implements OnDestroy {
  authStateSubscription: Subscription | undefined;
  storageItemSubscription: Subscription | undefined;

  @ViewChild(AddItemComponent) addItemModal!: AddItemComponent | null;

  searchControl: FormControl = new FormControl('');

  storageItems: StorageItem[] | undefined;
  filteredItems: StorageItem[] | undefined;
  itemSelectedForEdit: StorageItem | undefined;
  searchQuery: string = '';

  constructor(
    private storageService: StorageService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const storageId = '0'; // TODO get storage id from user

    this.storageItemSubscription = this.storageService
      .getItemsByStorageId(storageId, this.searchQuery)
      .subscribe({
        next: (items) => {
          if (items) {
            this.storageItems = items;
            this.filteredItems = this.storageItems;
          } else {
            this.toastService.showInfo('No items found in storage');
          }
        },
        error: (err) =>
          this.toastService.showError(`Could not load items in storage ${err}`),
        complete: () => {
          this.storageItemSubscription?.unsubscribe();
        },
      });

    this.searchControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe((query) => {
        if (!this.storageItems) return;
        this.filteredItems = this.storageItems.filter((item) =>
          item.name.toLowerCase().includes(query.trim().toLowerCase())
        );
      });
  }

  ngOnDestroy(): void {
    this.storageItemSubscription?.unsubscribe();
    this.authStateSubscription?.unsubscribe();
  }

  clearAddItemForm() {
    if (this.addItemModal) {
      this.addItemModal.clearForm();
    }
  }

  getBackgroundColor(storageItem: any): string {
    const today = new Date();
    const expirationDate = new Date(storageItem.expirationDate);
    const timeDiff = expirationDate.getTime() - today.getTime();
    const daysToExpire = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysToExpire <= 1) {
      return 'bg-gradient-to-b from-red-50 to-red-200';
    } else if (daysToExpire <= 4) {
      return 'bg-gradient-to-b from-yellow-50 to-orange-200';
    } else {
      return 'bg-gradient-to-b from-green-50 to-green-200';
    }
  }
}
