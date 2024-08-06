import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { AddItemComponent } from 'src/app/component/add-item/add-item.component';
import { EditItemComponent } from 'src/app/component/edit-item/edit-item.component';
import { FridgeItem } from 'src/app/models/fridgeItem';
import { FridgeService } from 'src/app/shared/fridge.service';
import { ToastService } from 'src/app/shared/toast.service';

@Component({
  standalone: true,
  selector: 'app-view-fridge',
  templateUrl: 'view-fridge.component.html',
  styleUrls: ['view-fridge.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AddItemComponent,
    EditItemComponent,
  ],
})
export class ViewFridgeComponent implements OnDestroy {
  authStateSubscription: Subscription | undefined;
  fridgeItemsSubscription: Subscription | undefined;

  @ViewChild(AddItemComponent) addItemModal!: AddItemComponent | null;

  searchControl: FormControl = new FormControl('');

  fridgeItems: FridgeItem[] | undefined;
  filteredItems: FridgeItem[] | undefined;
  itemSelectedForEdit: FridgeItem | undefined;
  searchQuery: string = '';

  constructor(
    private fridgeService: FridgeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const fridgeId = '0'; // TODO get fridge id from user
    this.fridgeItemsSubscription = this.fridgeService
      .getItemsByFridgeId(fridgeId, this.searchQuery)
      .subscribe({
        next: (items) => {
          if (items) {
            this.fridgeItems = items;
            this.filteredItems = this.fridgeItems;
          } else {
            this.toastService.showInfo('No items found in fridge');
          }
        },
        error: (err) =>
          this.toastService.showError(`Could not load items in fridge ${err}`),
        complete: () => {
          this.fridgeItemsSubscription?.unsubscribe();
        },
      });

    this.searchControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe((query) => {
        if (!this.fridgeItems) return;
        this.filteredItems = this.fridgeItems.filter((item) =>
          item.name.toLowerCase().includes(query.trim().toLowerCase())
        );
      });
  }

  ngOnDestroy(): void {
    this.fridgeItemsSubscription?.unsubscribe();
    this.authStateSubscription?.unsubscribe();
  }

  clearAddItemForm() {
    if (this.addItemModal) {
      this.addItemModal.clearForm();
    }
  }
}
