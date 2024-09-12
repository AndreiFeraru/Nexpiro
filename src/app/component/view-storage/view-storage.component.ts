import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { AddItemComponent } from 'src/app/component/add-item/add-item.component';
import { EditItemComponent } from 'src/app/component/edit-item/edit-item.component';
import { SortDirection } from 'src/app/models/sortDirection';
import { SortOption } from 'src/app/models/sortOption';
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
  @ViewChild('storageDropdown') storageDropdown!: ElementRef;
  @ViewChild('sortDropdown') sortDropdown!: ElementRef;

  authStateSubscription: Subscription | undefined;

  storages: Storage[] | undefined;

  storageItemSubscription: Subscription | undefined;
  storageItems: StorageItem[] | undefined;
  filteredItems: StorageItem[] | undefined;

  searchControl: FormControl = new FormControl('');
  searchQuery: string = '';

  sortOptionsArray: SortOption[] = Object.values(SortOption);

  selectedSortOption: SortOption = SortOption.Expiring;
  selectedSortDirection: SortDirection = SortDirection.Ascending;

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
        this.toastService.showWarning('No storages found');
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
            this.searchControl.setValue('');
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

  storageDropdownClicked(selectedItem: Storage) {
    this.storageDropdown.nativeElement.open = false;
    this.selectStorageAndLoadItems(selectedItem);
  }

  selectStorageAndLoadItems(storage: Storage) {
    this.selectedStorage = storage;
    localStorage.setItem('lastUsedStorageId', storage.id);
    this.loadStorageItems(storage.id);
  }

  sortDropdownClicked(selectedItem: SortOption) {
    this.sortDropdown.nativeElement.open = false;
    if (this.selectedSortOption == selectedItem) {
      this.selectedSortDirection = this.selectedSortDirection ^ 1; // Toggle sort direction
    } else {
      this.selectedSortOption = selectedItem;
    }
    // this.sortArrayBySelectedOption(this.storageItems, this.selectedSortOption);
    this.sortArrayBySelectedOption(this.filteredItems, this.selectedSortOption);
  }

  sortArrayBySelectedOption(
    array: StorageItem[] | undefined,
    sortOption: SortOption
  ) {
    if (!array) return;
    array.sort((a, b) => {
      let res: number;
      switch (sortOption) {
        case SortOption.Expiring:
          res =
            new Date(a.expirationDate).getTime() -
            new Date(b.expirationDate).getTime();
          break;
        case SortOption.Name:
          res = a.name.localeCompare(b.name);
          break;
        case SortOption.Added:
          res =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return this.selectedSortDirection == SortDirection.Ascending ? res : -res;
    });
  }

  getStatusCircleColorClass(storageItem: any): string {
    const timeDiff =
      new Date(storageItem.expirationDate).getTime() - new Date().getTime();
    const daysToExpire = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysToExpire <= 1) {
      return 'bg-gradient-to-b from-red-50 to-red-200';
    } else if (daysToExpire <= 4) {
      return 'bg-gradient-to-b from-yellow-50 to-orange-200';
    } else {
      return 'bg-gradient-to-b from-green-50 to-green-200';
    }
  }

  getSortDirectionClass(): string {
    return this.selectedSortDirection === SortDirection.Ascending
      ? 'fa-sort-asc'
      : 'fa-sort-desc';
  }

  getDateFormatted(date: string): string {
    return date.split('T')[0];
  }
}
