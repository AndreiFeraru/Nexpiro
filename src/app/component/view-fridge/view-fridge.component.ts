import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FridgeService } from 'src/app/shared/fridge.service';

import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  standalone: true,
  selector: 'app-view-fridge',
  templateUrl: 'view-fridge.component.html',
  styleUrls: ['view-fridge.component.css'],
  imports: [
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatPaginatorModule,
  ],
})
export class ViewFridgeComponent implements AfterViewInit {
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
}

export interface FridgeItem {
  id: string;
  name: string;
  expirationDate: Date;
}
