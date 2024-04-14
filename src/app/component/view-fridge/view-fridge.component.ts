import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AddItemComponent } from 'src/app/component/add-item/add-item.component';
import { EditItemComponent } from 'src/app/component/edit-item/edit-item.component';
import { FridgeItem } from 'src/app/models/fridgeItem';
import { AuthService } from 'src/app/shared/auth.service';
import { FridgeService } from 'src/app/shared/fridge.service';

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

  fridgeItems: FridgeItem[] | undefined;

  itemSelectedForEdit: FridgeItem | undefined;

  addItemInstance: AddItemComponent;

  constructor(
    private fridgeService: FridgeService,
    private authService: AuthService
  ) {
    this.addItemInstance = new AddItemComponent(
      this.fridgeService,
      this.authService
    );
  }

  ngOnInit(): void {
    const fridgeId = '0';
    this.fridgeItemsSubscription = this.fridgeService
      .getItemsByFridgeId(fridgeId)
      .subscribe({
        next: (items) => {
          if (items) {
            this.fridgeItems = items;
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
}
