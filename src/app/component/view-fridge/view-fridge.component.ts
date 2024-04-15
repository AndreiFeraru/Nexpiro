import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
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

  fridgeItems: FridgeItem[] | undefined;
  itemSelectedForEdit: FridgeItem | undefined;

  constructor(
    private fridgeService: FridgeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const fridgeId = '0';
    this.fridgeItemsSubscription = this.fridgeService
      .getItemsByFridgeId(fridgeId)
      .subscribe({
        next: (items) => {
          if (items) {
            this.fridgeItems = items;
          } else {
            this.toastService.showInfo('No items found in fridge');
          }
        },
        error: (e) =>
          this.toastService.showError('Could not load items in fridge'),
        complete: () => {
          this.fridgeItemsSubscription?.unsubscribe();
        },
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
