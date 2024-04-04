import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/auth.service';
import { User } from '@angular/fire/auth';

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
export class ViewFridgeComponent implements AfterViewInit, OnDestroy {
  authStateSubscription: Subscription;
  currentUser: User | null = null;

  public nameFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();

  displayedColumns: string[] = ['id', 'name', 'expirationDate'];
  dataSource: MatTableDataSource<FridgeItem> =
    new MatTableDataSource<FridgeItem>([]);
  fridgeItemsSubscription: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fridgeService: FridgeService,
    private authService: AuthService
  ) {
    this.authStateSubscription = this.authService.authState$.subscribe(
      (user) => {
        this.currentUser = user;
      }
    );
    const fridgeId = '0';
    this.fridgeItemsSubscription = fridgeService
      .getItemsByFridgeId(fridgeId)
      .subscribe({
        next: (items) => {
          if (items) {
            this.dataSource.data = items; // Use 'data' property to update the data source
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            console.log(this.dataSource);
          } else {
            console.log('No fridge items available');
          }
        },
        error: (e) => console.error(e),
        complete: () => console.info('complete'),
      });
  }
  ngOnDestroy(): void {
    this.fridgeItemsSubscription.unsubscribe();
    this.authStateSubscription.unsubscribe();
  }

  ngOnInit(): void {}

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
      return;
      // TODO show error
    }

    const date = new Date();
    const stringDate = date.toISOString().split('T')[0];

    if (this.currentUser?.displayName === undefined) {
      console.log(`Could not retrieve user name`);
      return;
    }

    const item: FridgeItem = {
      id: 1,
      name: itemName,
      expirationDate: stringDate,
      createdAt: stringDate,
      lastModified: stringDate,
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
