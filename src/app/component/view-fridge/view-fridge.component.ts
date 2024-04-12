import { Component, OnDestroy } from '@angular/core';
import { FridgeService } from 'src/app/shared/fridge.service';

import { FridgeItem } from 'src/app/models/fridgeItem';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/auth.service';
import { User } from '@angular/fire/auth';
import { v4 as uuidv4 } from 'uuid';

@Component({
  standalone: true,
  selector: 'app-view-fridge',
  templateUrl: 'view-fridge.component.html',
  styleUrls: ['view-fridge.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
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

  constructor(
    private fridgeService: FridgeService,
    private authService: AuthService
  ) {
    this.clearForm();
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

  addItem(
    itemName: string | undefined,
    description: string | undefined,
    expirationDate: string | undefined
  ) {
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

    const item: FridgeItem = {
      id: uuidv4(),
      name: itemName,
      description: description,
      expirationDate: expirationDate,
      createdAt: dateNow,
      lastModified: dateNow,
      lastModifiedBy: this.currentUser.displayName as string,
    };
    this.fridgeService.addItemToFridge('0', item).then(
      () => {
        // Todo write in label
        console.log(`Item added successfully ${item.name}`);
        this.name = 'xcz';
        this.clearForm();
      },
      (err) => {
        console.log(`Error adding item ${item.name} ${err}`);
      }
    );
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
