import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.css'],
})
export class DeleteModalComponent {
  @Input() itemName: string = '';
  @Output() deleteConfirmed = new EventEmitter<void>();

  constructor() {}

  onConfirmDelete() {
    this.deleteConfirmed.emit();
  }
}
