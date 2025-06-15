import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { AddItemComponent } from 'src/app/component/modals/add-item/add-item.component';
import { EditItemComponent } from 'src/app/component/modals/edit-item/edit-item.component';
import { SortDirection } from 'src/app/models/sortDirection';
import { SortOption } from 'src/app/models/sortOption';
import { StorageDetails } from 'src/app/models/storageDetails';
import { StorageItem } from 'src/app/models/storageItem';
import {
  AllFalseUerPermissionDetails,
  UserPermissionDetails,
} from 'src/app/models/userPermissionDetails';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { StorageItemService } from 'src/app/services/storageItem.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserPermissionsService } from 'src/app/services/user-permissions.service';
import { DeleteModalComponent } from '../modals/delete-modal/delete-modal.component';

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
    DeleteModalComponent,
  ],
})
export class ViewStorageComponent implements OnDestroy {
  @ViewChild(AddItemComponent) addItemModal!: AddItemComponent | null;
  @ViewChild('storageDropdown') storageDropdown!: ElementRef;
  @ViewChild('sortDropdown') sortDropdown!: ElementRef;
  authStateSubscription: Subscription | undefined;

  storages: StorageDetails[] | undefined;

  storageItemSubscription: Subscription | undefined;
  storageItems: StorageItem[] | undefined;
  filteredItems: StorageItem[] | undefined;

  searchControl: FormControl = new FormControl('');
  searchQuery: string = '';

  sortOptionsArray: SortOption[] = Object.values(SortOption);

  selectedSortOption: SortOption = SortOption.Expiring;
  selectedSortDirection: SortDirection = SortDirection.Ascending;

  itemSelectedForEdit: StorageItem | undefined;
  itemSelectedForDelete: StorageItem | undefined;

  selectedStorage: StorageDetails | undefined;
  currentUserPermissionsForSelectedStorage: UserPermissionDetails | undefined;

  loggedInUserId: string | undefined;

  ui_isSearchExpanded: boolean = true;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private storageService: StorageService,
    private storageItemService: StorageItemService,
    private userPermissionsService: UserPermissionsService
  ) {}

  ngOnInit(): void {
    this.authStateSubscription = this.authService.authState$.subscribe({
      next: async (user) => {
        if (!user?.uid) {
          this.toastService.showError('User not found');
          return;
        }

        this.loggedInUserId = user.uid;

        try {
          await this.loadStorages(user.uid);
          if (!this.storages || this.storages.length === 0) {
            return;
          }

          const lastUsedStorageId = localStorage.getItem('lastUsedStorageId');
          if (!lastUsedStorageId) {
            this.selectStorageAndLoadItems(this.storages[0]);
            return;
          }
          const lastUsedStorage = this.storages.find(
            (storage) => storage.id === lastUsedStorageId
          );
          if (!lastUsedStorage) {
            this.selectStorageAndLoadItems(this.storages[0]);
            return;
          }
          this.selectStorageAndLoadItems(lastUsedStorage);
        } catch (err) {
          this.toastService.showError(`Could not load storages ${err}`);
        }
      },
      error: (err) => {
        this.toastService.showError(`An error occurred ${err}`);
      },
    });

    this.initSearch();
  }

  private initSearch() {
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
            this.sortArrayBySelectedOption(
              this.filteredItems,
              this.selectedSortOption,
              this.selectedSortDirection
            );
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

  storageDropdownClicked(selectedItem: StorageDetails) {
    this.selectStorageAndLoadItems(selectedItem);
  }

  selectStorageAndLoadItems(storage: StorageDetails) {
    this.selectedStorage = storage;
    localStorage.setItem('lastUsedStorageId', storage.id);
    this.loadStorageItems(storage.id);
    this.updateCurrentUserPermissionsForSelectedStorage(storage);
  }

  updateCurrentUserPermissionsForSelectedStorage(storage: StorageDetails) {
    const permissions =
      this.userPermissionsService.getUserPermissionsForStorage(
        this.loggedInUserId || '',
        storage
      );

    this.currentUserPermissionsForSelectedStorage =
      permissions || AllFalseUerPermissionDetails;
  }

  sortDropdownClicked(selectedItem: SortOption) {
    this.sortDropdown.nativeElement.open = false;
    if (this.selectedSortOption == selectedItem) {
      this.selectedSortDirection = this.selectedSortDirection ^ 1; // Toggle sort direction
    } else {
      this.selectedSortOption = selectedItem;
    }
    this.sortArrayBySelectedOption(
      this.filteredItems,
      this.selectedSortOption,
      this.selectedSortDirection
    );
  }

  sortArrayBySelectedOption(
    array: StorageItem[] | undefined,
    sortOption: SortOption = this.selectedSortOption,
    sortDirection: SortDirection = this.selectedSortDirection
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
      return sortDirection == SortDirection.Ascending ? res : -res;
    });
  }

  getStatusCircleColorClass(storageItem: StorageItem): string {
    if (!storageItem.expirationDate) {
      return 'hidden';
    }

    const daysToExpire = this.getDaysToExpire(storageItem.expirationDate);

    if (daysToExpire <= 1) {
      // return 'bg-gradient-to-b from-red-50 to-red-200';
      return 'bg-red-200';
    } else if (daysToExpire <= 4) {
      // return 'bg-gradient-to-b from-yellow-50 to-orange-200';
      return 'bg-orange-200';
    } else {
      // return 'bg-gradient-to-b from-green-50 to-green-200';
      return 'bg-green-200';
    }
  }

  getDaysToExpire(expirationDate: string): number {
    const daysToExpire = Math.ceil(
      (new Date(expirationDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysToExpire;
  }

  getDaysToExpireText(expirationDate: string): string {
    const daysToExpire = this.getDaysToExpire(expirationDate);

    if (daysToExpire > 9) {
      return '9+';
    } else return '' + daysToExpire;
  }

  getSortDirectionClass(sortOption: string): string {
    const icon: string =
      this.selectedSortDirection === SortDirection.Ascending
        ? 'fa-sort-asc'
        : 'fa-sort-desc';
    const visibility: string =
      this.selectedSortOption === sortOption ? 'visible' : 'hidden';
    return `${icon} ${visibility}`;
  }

  getDateFormatted(date: string): string {
    return date.split('T')[0];
  }

  onDeleteItemClicked(item: StorageItem) {
    this.itemSelectedForDelete = item;
  }

  onConfirmDelete() {
    if (!this.selectedStorage) {
      this.toastService.showError('Storage is not selected');
      return;
    }
    if (!this.itemSelectedForDelete?.id) {
      this.toastService.showError('Item id is missing');
      return;
    }
    this.storageItemService
      .deleteItem(this.itemSelectedForDelete.id, this.selectedStorage?.id)
      .then(() => {
        this.toastService.showSuccess('Item deleted successfully');
      })
      .catch((err) => {
        this.toastService.showError(`Could not delete item: ${err}`);
      });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.storageDropdown.nativeElement.open &&
      !this.storageDropdown.nativeElement.contains(event.target)
    ) {
      this.storageDropdown.nativeElement.removeAttribute('open');
    }
    if (
      this.sortDropdown.nativeElement.open &&
      !this.sortDropdown.nativeElement.contains(event.target)
    ) {
      this.sortDropdown.nativeElement.removeAttribute('open');
    }
  }

  handleStorageDropdownClick() {
    if (this.ui_isSearchExpanded) {
      this.ui_isSearchExpanded = false;
      this.storageDropdown.nativeElement.open = false;
      return;
    } else {
      this.storageDropdown.nativeElement.open =
        !this.storageDropdown.nativeElement.open;
    }
  }

  // ===== Filter Controls =====
  // Add properties for the filter controls
  showBgControls = false;
  blur = 3;
  hueRotate = 160;
  saturation = 1.2;
  contrast = 0.4;
  brightness = 1.4;

  // Add method to toggle control visibility
  toggleBgControls() {
    this.showBgControls = !this.showBgControls;
  }

  // Add method to update the background filters
  updateBgFilters() {
    const filterString = `blur(${this.blur}px) hue-rotate(${this.hueRotate}deg) saturate(${this.saturation}) contrast(${this.contrast}) brightness(${this.brightness})`;

    // Get the background element and apply the filters
    const bgElement = document.querySelector(
      '.fixed.inset-0.-z-10 .absolute.inset-0'
    ) as HTMLElement;
    if (bgElement) {
      bgElement.style.filter = filterString;
    }
  }
  // ===== End Filter Controls =====
}
