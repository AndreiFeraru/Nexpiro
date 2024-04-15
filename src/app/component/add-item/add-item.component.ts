import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FridgeItem } from 'src/app/models/fridgeItem';
import { ToastType } from 'src/app/models/toast';
import { AuthService } from 'src/app/shared/auth.service';
import { FridgeService } from 'src/app/shared/fridge.service';
import { ToastService } from 'src/app/shared/toast.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  standalone: true,
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.sass'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class AddItemComponent implements OnDestroy {
  authStateSubscription: Subscription | undefined;

  name: string | undefined;
  description: string | undefined;
  expirationDate: string | undefined;
  currentUser: User | null = null;

  fridgeId: string = '0';

  constructor(
    private fridgeService: FridgeService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.authStateSubscription = this.authService.authState$.subscribe(
      (user) => {
        this.currentUser = user;
      }
    );
    this.clearForm();
  }

  ngOnDestroy(): void {
    this.authStateSubscription?.unsubscribe();
  }

  public clearForm() {
    this.name = '';
    this.description = '';
    this.expirationDate = new Date().toISOString().split('T')[0];
  }

  validateForm(): boolean {
    if (!this.name) {
      this.toastService.showError('Item name is required');
      return false;
    }

    if (!this.expirationDate) {
      this.toastService.showError('Expiration date is required');
      return false;
    }

    if (this.currentUser?.displayName === undefined) {
      this.toastService.showError(`Could not retrieve user name`);
      return false;
    }

    this.name = this.name.trim();
    this.description = this.description?.trim();

    return true;
  }

  addItem() {
    if (!this.validateForm()) {
      return;
    }

    const dateNow = new Date().toISOString().split('T')[0];

    const item: FridgeItem = {
      id: uuidv4(),
      name: this.name!,
      description: this.description,
      expirationDate: this.expirationDate!,
      createdAt: dateNow,
      lastModified: dateNow,
      lastModifiedBy: this.currentUser!.displayName as string,
    };

    this.fridgeService.addItemToFridge(this.fridgeId, item).then(
      () => {
        this.toastService.showSuccess(`Item added successfully ${item.name}`);
        this.clearForm();
      },
      (err) => {
        this.toastService.showError(`Error adding item ${item.name}`);
      }
    );
  }
}
