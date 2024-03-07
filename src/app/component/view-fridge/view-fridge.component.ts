import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FridgeService } from 'src/app/shared/fridge.service';

import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { FridgeItem } from 'src/app/models/fridgeItem';

import { ErrorStateMatcher } from '@angular/material/core';
import { NgIf } from '@angular/common';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  standalone: true,
  selector: 'app-view-fridge',
  templateUrl: 'view-fridge.component.html',
  styleUrls: ['view-fridge.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressBarModule,
    NgIf,
  ],
})
export class ViewFridgeComponent implements AfterViewInit {
  public nameFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();

  displayedColumns: string[] = ['id', 'name', 'expirationDate'];
  fridgeItems: FridgeItem[] = [];
  dataSource: MatTableDataSource<FridgeItem> =
    new MatTableDataSource<FridgeItem>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fridgeService: FridgeService) {}

  ngOnInit(): void {
    this.loadFridgeItems();
  }

  loadFridgeItems(): void {
    this.fridgeService
      .getItemsByFridgeId('0')
      .then((items) => {
        if (items) {
          this.fridgeItems = Object.values(items);
          this.dataSource = new MatTableDataSource(this.fridgeItems);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          console.log(this.dataSource);
        } else {
          console.log('No fridge items available');
        }
      })
      .catch((error) => {
        console.error('Error fetching fridge items:', error);
        // TODO Handle error appropriately, e.g., display an error message
      });
  }

  ngAfterViewInit() {
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return (
        data.name.toLowerCase().includes(filter) ||
        data.expirationDate.toString().includes(filter)
      );
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addItem(itemName: string) {
    itemName = itemName.trim();
    if (!itemName) {
      return; // TODO show error
      // OR remove this part entirely if the validator is enough
    }

    const date = new Date();
    const stringDate = date.toISOString().split('T')[0];

    const item: FridgeItem = {
      id: 1,
      name: itemName,
      expirationDate: stringDate,
      createdAt: stringDate,
      lastModified: stringDate,
      createdBy: 'andreif',
    };
    this.fridgeService.addItemToFridge('0', item);
  }
}
