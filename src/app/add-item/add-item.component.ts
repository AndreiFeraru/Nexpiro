import { Subscription } from 'rxjs';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from '@angular/fire/auth';
import { FridgeItem } from '../models/fridgeItem';
import { v4 as uuidv4 } from 'uuid';
import { FridgeService } from '../shared/fridge.service';
import { AuthService } from '../shared/auth.service';

@Component({
  standalone: true,
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.sass'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class AddItemComponent implements OnDestroy {
  name: string | undefined;
  description: string | undefined;
  expirationDate: string | undefined;
  currentUser: User | null = null;

  authStateSubscription: Subscription | undefined;

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
  }

  ngOnDestroy(): void {
    this.authStateSubscription?.unsubscribe();
  }

  public clearForm() {
    this.name = '';
    this.description = '';
    this.expirationDate = new Date().toISOString().split('T')[0];
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
}
