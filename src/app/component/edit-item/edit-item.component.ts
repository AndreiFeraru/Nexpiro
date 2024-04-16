import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FridgeItem } from 'src/app/models/fridgeItem';
import { FridgeService } from 'src/app/shared/fridge.service';
import { ToastService } from 'src/app/shared/toast.service';

@Component({
  standalone: true,
  selector: 'app-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.css'],
  imports: [FormsModule],
})
export class EditItemComponent implements OnChanges {
  name: string | undefined;
  description: string | undefined;
  expirationDate: string | undefined;

  @Input() itemSelectedForEdit: FridgeItem | undefined;

  fridgeId: string = '0';

  constructor(
    private fridgeService: FridgeService,
    private toastService: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
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
    this.clearForm();
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
    if (!this.validateForm()) {
      return;
    }

    this.updateSelectedForEdit();

    this.fridgeService
      .updateItemInFridge(this.fridgeId, this.itemSelectedForEdit!)
      .then(
        () => {
          this.toastService.showSuccess(
            `Item updated successfully ${this.itemSelectedForEdit!.name}`
          );
          this.clearForm();
          this.itemSelectedForEdit = undefined;
        },
        (err) => {
          this.toastService.showError(
            `Error updating item ${this.itemSelectedForEdit!.name}: ${err}`
          );
        }
      );
  }

  validateForm(): boolean {
    if (!this.itemSelectedForEdit) {
      this.toastService.showError('No item selected for edit');
      return false;
    }
    if (!this.name) {
      this.toastService.showError('Item name is required');
      return false;
    }
    if (!this.expirationDate) {
      this.toastService.showError('Expiration date is required');
      return false;
    }

    this.name = this.name.trim();
    this.description = this.description?.trim();

    return true;
  }

  updateSelectedForEdit() {
    if (this.itemSelectedForEdit === undefined) return;
    this.itemSelectedForEdit.name = this.name as string;
    this.itemSelectedForEdit.description = this.description;
    this.itemSelectedForEdit.expirationDate = this.expirationDate as string;
    const dateNow = new Date().toISOString().split('T')[0];
    this.itemSelectedForEdit.lastModified = dateNow;
  }
}
