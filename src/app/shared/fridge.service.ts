import { Injectable } from '@angular/core';
import {
  Database,
  get,
  ref,
  child,
  onValue,
  set,
  push,
} from '@angular/fire/database';
import { FridgeItem } from '../models/fridgeItem';
import { Observable, ReplaySubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FridgeService {
  fridgeItems$: Observable<FridgeItem[]>;

  constructor(private db: Database) {}

  getItemsByFridgeId(fridgeId: string): Observable<FridgeItem[]> {
    if (!fridgeId) {
      console.log('No fridge id!');
      throw 'No fridge id!'; // TODO
    }
    const fridgesRef = ref(this.db, `fridges/${fridgeId}`);
    new Observable();
    return onValue(
      fridgesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data: FridgeItem[] = snapshot.val();
          return data;
          this.fridgeItems$ = data;
        } else {
          return null;
        }
      },
      (err) => {
        console.log(err);
        throw err;
      }
    );
  }

  addItemToFridge(fridgeId: string, item: FridgeItem) {
    const itemsRef = ref(this.db, `fridges/${fridgeId}/items`);
    const newItemRef = push(itemsRef);
    set(newItemRef, item)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    return item.id;
  }
}
