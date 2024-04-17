import { Injectable } from '@angular/core';
import { Database, ref, onValue, set, get } from '@angular/fire/database';
import { FridgeItem } from '../models/fridgeItem';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FridgeService {
  constructor(private db: Database) {}

  getItemsByFridgeId(fridgeId: string): Observable<FridgeItem[]> {
    if (!fridgeId) {
      throw 'Did not receive fridge id';
    }
    const fridgesRef = ref(this.db, `fridges/${fridgeId}`);
    const subject = new ReplaySubject<FridgeItem[]>(1);

    onValue(
      fridgesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data || !data.items) {
          subject.next([]);
          return;
        }
        const itemsArray: FridgeItem[] = Object.values(data.items);
        subject.next(itemsArray);
      },
      (err) => {
        subject.error(err);
      }
    );

    return subject.asObservable();
  }

  async addItemToFridge(fridgeId: string, item: FridgeItem) {
    const itemPath = `fridges/${fridgeId}/items/${item.id}`;
    const newItemRef = ref(this.db, itemPath);

    await set(newItemRef, item);
  }

  async updateItemInFridge(fridgeId: string, item: FridgeItem) {
    const itemPath = `fridges/${fridgeId}/items/${item.id}`;
    const itemRef = ref(this.db, itemPath);

    await get(itemRef).then((snapshot) => {
      if (snapshot.exists() && snapshot.val()) {
        set(itemRef, item);
      } else {
        throw 'Item does not exist';
      }
    });
  }
}
