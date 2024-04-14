import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FridgeItem } from 'src/app/models/fridgeItem';
import { AuthService } from 'src/app/shared/auth.service';
import { FridgeService } from 'src/app/shared/fridge.service';

@Component({
  standalone: true,
  selector: 'app-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.sass'],
  imports: [FormsModule],
})
export class EditItemComponent implements OnChanges {
  name: string | undefined;
  description: string | undefined;
  expirationDate: string | undefined;
  currentUser: User | null = null;

  @Input() itemSelectedForEdit: FridgeItem | undefined;

  authStateSubscription: Subscription | undefined;

  constructor(
    private fridgeService: FridgeService,
    private authService: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges called with changes:', changes);
    if (
      !changes['itemSelectedForEdit'] ||
      !changes['itemSelectedForEdit'].currentValue
    ) {
      return;
    }
    this.itemSelectedForEdit = changes['itemSelectedForEdit'].currentValue;
    this.updateFormValues(this.itemSelectedForEdit);
  }

  ngOnInit(): void {
    // this.clearForm();
    this.authStateSubscription = this.authService.authState$.subscribe(
      (user) => {
        this.currentUser = user;
      }
    );
  }

  ngOnDestroy(): void {
    this.authStateSubscription?.unsubscribe();
  }

  clearForm() {
    this.name = '';
    this.description = '';
    this.expirationDate = new Date().toISOString().split('T')[0];
  }

  updateFormValues(itemSelectedForEdit: FridgeItem | undefined) {
    this.name = itemSelectedForEdit?.name;
    this.description = itemSelectedForEdit?.description;
    this.expirationDate = itemSelectedForEdit?.expirationDate;
  }

  editItem() {
    if (!this.itemSelectedForEdit) {
      alert('No item selected for edit');
      return;
    }
    if (!this.name) {
      alert('Item name is required');
      return;
    }
    if (!this.expirationDate) {
      alert('Expiration date is required');
      return;
    }
    if (this.currentUser?.displayName === undefined) {
      console.log(`Could not retrieve user name`);
      return;
    }

    this.name = this.name.trim();
    this.description = this.description?.trim();
    const dateNow = new Date().toISOString().split('T')[0];

    this.itemSelectedForEdit.name = this.name as string;
    this.itemSelectedForEdit.description = this.description;
    this.itemSelectedForEdit.expirationDate = this.expirationDate as string;
    this.itemSelectedForEdit.lastModified = dateNow;

    this.fridgeService.updateItemInFridge('0', this.itemSelectedForEdit).then(
      () => {
        console.log(
          `Item updated successfully ${this.itemSelectedForEdit!.name}`
        );
        this.clearForm();
        this.itemSelectedForEdit = undefined;
      },
      (err) => {
        console.log(
          `Error updating item ${this.itemSelectedForEdit!.name} ${err}`
        );
      }
    );
  }
}
