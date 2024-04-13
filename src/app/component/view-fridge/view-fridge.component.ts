import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AddItemComponent } from 'src/app/component/add-item/add-item.component';
import { FridgeItem } from 'src/app/models/fridgeItem';
import { AuthService } from 'src/app/shared/auth.service';
import { FridgeService } from 'src/app/shared/fridge.service';

@Component({
  standalone: true,
  selector: 'app-view-fridge',
  templateUrl: 'view-fridge.component.html',
  styleUrls: ['view-fridge.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, AddItemComponent],
})
export class ViewFridgeComponent implements OnDestroy {
  authStateSubscription: Subscription | undefined;
  fridgeItemsSubscription: Subscription | undefined;

  fridgeItems: FridgeItem[] | undefined;
  currentUser: User | null = null;

  name: string | undefined;
  description: string | undefined;
  expirationDate: string | undefined;

  itemSelectedForEdit: FridgeItem | undefined;

  addItemInstance: AddItemComponent;

  constructor(
    private fridgeService: FridgeService,
    private authService: AuthService
  ) {
    this.clearForm();
    this.addItemInstance = new AddItemComponent(
      this.fridgeService,
      this.authService
    );
  }

  ngOnInit(): void {
    this.authStateSubscription = this.authService.authState$.subscribe(
      (user) => {
        this.currentUser = user;
      }
    );
    const fridgeId = '0';
    this.fridgeItemsSubscription = this.fridgeService
      .getItemsByFridgeId(fridgeId)
      .subscribe({
        next: (items) => {
          if (items) {
            this.fridgeItems = items;
            console.log('Received items', this.fridgeItems);
          } else {
            console.log('No fridge items available');
          }
        },
        error: (e) => console.error(e),
        complete: () => console.info('complete'),
      });
  }

  ngOnDestroy(): void {
    this.fridgeItemsSubscription?.unsubscribe();
    this.authStateSubscription?.unsubscribe();
  }

  loadItemForEdit(item: FridgeItem) {
    this.itemSelectedForEdit = item;
    this.name = this.itemSelectedForEdit.name;
    this.description = this.itemSelectedForEdit.description;
    this.expirationDate = this.itemSelectedForEdit.expirationDate;
  }

  editItem(
    itemSelectedForEdit: FridgeItem | undefined,
    itemName: string | undefined,
    description: string | undefined,
    expirationDate: string | undefined
  ) {
    if (!itemSelectedForEdit) {
      console.log('No item selected for edit');
      return;
    }
    if (!itemName) {
      alert('Item name is required');
      return;
    }
    if (!expirationDate) {
      alert('Expiration date is required');
      return;
    }
    if (this.currentUser?.displayName === undefined) {
      console.log(`Could not retrieve user name`);
      return;
    }

    itemName = itemName.trim();
    description = description?.trim();
    const dateNow = new Date().toISOString().split('T')[0];

    itemSelectedForEdit.name = itemName as string;
    itemSelectedForEdit.description = description;
    itemSelectedForEdit.expirationDate = expirationDate as string;
    itemSelectedForEdit.lastModified = dateNow;

    this.fridgeService.updateItemInFridge('0', itemSelectedForEdit).then(
      () => {
        console.log(`Item updated successfully ${itemSelectedForEdit.name}`);
        this.clearForm();
        this.itemSelectedForEdit = undefined;
      },
      (err) => {
        console.log(`Error updating item ${itemSelectedForEdit.name} ${err}`);
      }
    );
  }

  clearForm() {
    this.name = '';
    this.description = '';
    this.expirationDate = new Date().toISOString().split('T')[0];
  }
}
