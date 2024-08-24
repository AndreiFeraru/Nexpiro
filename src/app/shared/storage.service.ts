import { Injectable } from '@angular/core';
import { Database, get, onValue, ref, set } from '@angular/fire/database';
import { Observable, ReplaySubject } from 'rxjs';
import { StorageItem } from '../models/storageItem';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private db: Database) {}

  getStoragesForUser(userId: string): Observable<string[]> {
    if (!userId) {
      throw 'Did not receive user id';
    }
    const storagesRef = ref(this.db, `users/${userId}/storages`);
    const subject = new ReplaySubject<string[]>(1);

    onValue(
      storagesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          subject.next([]);
          return;
        }
        const storagesArray: string[] = Object.values(data);
        subject.next(storagesArray);
      },
      (err) => {
        subject.error(err);
      }
    );

    return subject.asObservable();
  }

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
    if (snapshot.exists() && snapshot.val()) {
      set(itemRef, item);
    } else {
      throw 'Item does not exist';
    }
  }
}
