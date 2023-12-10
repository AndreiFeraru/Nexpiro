import { Injectable } from '@angular/core';
import { Database } from '@angular/fire/database';
import { ref, child, get } from 'firebase/database';

@Injectable({
  providedIn: 'root',
})
export class FridgeService {
  constructor(private db: Database) {}

  getFridgeItemsByFridgeId(fridgeId: string): Promise<any> {
    const dbRef = ref(this.db);
    return get(child(dbRef, `fridges/${fridgeId}/fridgeItems`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          return null;
        }
      })
      .catch((error) => {
        throw error;
      });
  }
}
