import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { AddItemComponent } from 'src/app/component/add-item/add-item.component';
import { EditItemComponent } from 'src/app/component/edit-item/edit-item.component';
import { Storage } from 'src/app/models/storage';
import { StorageItem } from 'src/app/models/storageItem';
import { AuthService } from 'src/app/shared/auth.service';
import { StorageService } from 'src/app/shared/storage.service';
import { StorageItemService } from 'src/app/shared/storageItem.service';
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
  @ViewChild(AddItemComponent) addItemModal!: AddItemComponent | null;

  authStateSubscription: Subscription | undefined;

  storages: Storage[] | undefined;

  storageItemSubscription: Subscription | undefined;
  storageItems: StorageItem[] | undefined;
  filteredItems: StorageItem[] | undefined;

  searchControl: FormControl = new FormControl('');
  searchQuery: string = '';

  itemSelectedForEdit: StorageItem | undefined;
  selectedStorage: Storage | undefined;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private storageService: StorageService,
    private storageItemService: StorageItemService
  ) {}

  ngOnInit(): void {
    this.authStateSubscription = this.authService.authState$.subscribe({
      next: async (user) => {
        if (!user) {
          this.toastService.showError('User not found');
          return;
        }

        try {
          await this.loadStorages(user!.uid);
          if (!this.storages || this.storages.length === 0) {
            this.toastService.showInfo('No storages found');
            return;
          }

          const lastUsedStorageId = localStorage.getItem('lastUsedStorageId');

          if (!lastUsedStorageId) {
            this.selectStorageAndLoadItems(this.storages[0]);
            return;
          }

          const storage = this.storages.find(
            (storage) => storage.id === lastUsedStorageId
          );
          if (!storage) {
            this.selectStorageAndLoadItems(this.storages[0]);
            return;
          }

          this.selectStorageAndLoadItems(storage);
        } catch (err) {
          this.toastService.showError(`Could not load storages ${err}`);
        }
      },
      error: (err) => {
        this.toastService.showError(`An error occurred ${err}`);
      },
    });

    this.InitSearch();
  }

  private InitSearch() {
    this.searchControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe((query) => {
        if (!this.storageItems) return;
        this.filteredItems = this.storageItems.filter((item) =>
          item.name.toLowerCase().includes(query.trim().toLowerCase())
        );
      });
  }

  async loadStorages(userId: string) {
    try {
      const storages = await this.storageService.getStoragesForUser(userId);
      if (!storages || storages.length === 0) {
        this.toastService.showInfo('No storages found');
      }
      this.storages = storages;
    } catch (err) {
      this.toastService.showError(`Could not load storages ${err}`);
    }
  }

  loadStorageItems(storageId: string) {
    this.storageItemSubscription = this.storageItemService
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

  storageDropdownClicked(selectedItem: Storage, dropdown: HTMLDetailsElement) {
    dropdown.open = false;
    this.selectStorageAndLoadItems(selectedItem);
  }

  selectStorageAndLoadItems(storage: Storage) {
    this.selectedStorage = storage;
    localStorage.setItem('lastUsedStorageId', storage.id);
    this.loadStorageItems(storage.id);
  }
}
