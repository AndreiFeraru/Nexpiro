import { Component, OnDestroy } from '@angular/core';
import { FridgeService } from 'src/app/shared/fridge.service';

import { FridgeItem } from 'src/app/models/fridgeItem';

import { CommonModule } from '@angular/common';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/auth.service';
import { User } from '@angular/fire/auth';

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

  today: string | undefined;

  constructor(
    private fridgeService: FridgeService,
    private authService: AuthService
  ) {
    this.today = new Date().toISOString().split('T')[0];
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

  addItem(itemName: string, description: string, expirationDate: string) {
    itemName = itemName.trim();
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

    const dateNow = new Date().toISOString().split('T')[0];

    const item: FridgeItem = {
      id: 1,
      name: itemName,
      expirationDate: expirationDate,
      createdAt: dateNow,
      lastModified: dateNow,
      createdBy: this.currentUser.displayName as string,
    };
    this.fridgeService.addItemToFridge('0', item).then(
      () => {
        // Todo write in label
        console.log(`Item added successfully ${item.name}`);
      },
      (err) => {
        console.log(`Error adding item ${item.name} ${err}`);
      }
    );
  }
}
