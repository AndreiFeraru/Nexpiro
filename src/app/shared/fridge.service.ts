import { Injectable } from '@angular/core';
import { Database, get, ref, child, set, push } from '@angular/fire/database';
import { FridgeItem } from '../models/fridgeItem';

@Injectable({
  providedIn: 'root',
})
export class FridgeService {
  constructor(private db: Database) {}

  getItemsByFridgeId(fridgeId: string): Promise<any> {
    const dbRef = ref(this.db);
    return get(child(dbRef, `fridges/${fridgeId}/items`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          return null;
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  addItemToFridge(fridgeId: string, item: FridgeItem) {
    const itemsRef = ref(this.db, `fridges/${fridgeId}/items`);
    const newItemRef = push(itemsRef);
    set(newItemRef, item)
      .then((res) => {
        alert('success');
        console.log(res);
      })
      .catch((err) => {
        alert('error');
        console.log(err);
      });
    return item.id;
  }
}
