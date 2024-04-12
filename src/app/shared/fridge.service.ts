import { Injectable } from '@angular/core';
import {
  Database,
  ref,
  onValue,
  set,
  push,
  getDatabase,
  get,
  child,
} from '@angular/fire/database';
import { FridgeItem } from '../models/fridgeItem';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FridgeService {
  constructor(private db: Database) {}

  getItemsByFridgeId(fridgeId: string): Observable<FridgeItem[]> {
    if (!fridgeId) {
      console.log('No fridge id!');
      throw 'No fridge id!'; // TODO
    }
    const fridgesRef = ref(this.db, `fridges/${fridgeId}`);
    const subject = new ReplaySubject<FridgeItem[]>(1);

    onValue(
      fridgesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          subject.next([]);
          return;
        }
        console.log(data);
        const items = data.items;
        console.log(items);
        const itemsArray: FridgeItem[] = Object.values(items);
        console.log(itemsArray);
        subject.next(itemsArray);
      },
      (err) => {
        console.log(err);
        subject.error(err);
      }
    );

    return subject.asObservable();
  }

  async addItemToFridge(fridgeId: string, item: FridgeItem) {
    const newItemRef = ref(this.db, `fridges/${fridgeId}/items/${item.id}`);
    await set(newItemRef, item);
  }

  async updateItemInFridge(fridgeId: string, item: FridgeItem) {
    const itemPath = `fridges/${fridgeId}/items/${item.id}`;
    const itemRef = ref(this.db, itemPath);

    await get(itemRef)
      .then((snapshot) => {
        if (snapshot.exists() && snapshot.val()) {
          set(itemRef, item);
        } else {
          // error: could not find item to update
          console.log('No data available');
        }
      })
      .catch((error) => {
        // error: could not update item
        console.error(error);
      });
  }
}
