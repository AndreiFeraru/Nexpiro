import { Injectable } from '@angular/core';
import { Database, ref, onValue, set, push } from '@angular/fire/database';
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
    const itemsRef = ref(this.db, `fridges/${fridgeId}/items`);
    const newItemRef = push(itemsRef);
    await set(newItemRef, item);
  }
}
