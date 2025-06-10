import { Injectable } from '@angular/core';
import { Database, get, onValue, ref, set } from '@angular/fire/database';
import { Observable, ReplaySubject } from 'rxjs';
import { StorageItem } from '../models/storageItem';

@Injectable({
  providedIn: 'root',
})
export class StorageItemService {
  constructor(private db: Database) {}

  getItemsByStorageId(
    storageId: string,
    query: string
  ): Observable<StorageItem[]> {
    if (!storageId) {
      throw 'Did not receive storage id';
    }
    const storagesRef = ref(this.db, `storages/${storageId}`);
    const subject = new ReplaySubject<StorageItem[]>(1);

    onValue(
      storagesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data || !data.items) {
          subject.next([]);
          return;
        }
        const itemsArray: StorageItem[] = Object.values(data.items);
        subject.next(itemsArray);
      },
      (err) => {
        subject.error(err);
      }
    );

    return subject.asObservable();
  }

  async addItemToStorage(storageId: string, item: StorageItem) {
    const itemPath = `storages/${storageId}/items/${item.id}`;
    const newItemRef = ref(this.db, itemPath);

    await set(newItemRef, item);
  }

  async updateItemInStorage(storageId: string, item: StorageItem) {
    const itemPath = `storages/${storageId}/items/${item.id}`;
    const itemRef = ref(this.db, itemPath);

    const snapshot = await get(itemRef);
    if (!snapshot.exists() || !snapshot.val()) {
      throw 'Item does not exist';
    }
    set(itemRef, item);
  }

  async deleteItem(itemId: string, storageId: string) {
    const itemPath = `storages/${storageId}/items/${itemId}`;
    const itemRef = ref(this.db, itemPath);

    await set(itemRef, null);
  }
}
