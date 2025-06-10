import { Injectable } from '@angular/core';
import { Database, get, ref, set } from '@angular/fire/database';
import { StorageDetails } from '../models/storageDetails';
import { UserPermissionDetails } from '../models/userPermissionDetails';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private db: Database) {}

  async addStorage(storage: StorageDetails) {
    const storagePath = `storageInfo/${storage.id}`;
    const storageRef = ref(this.db, storagePath);
    await set(storageRef, storage);
  }

  async editStorage(storage: StorageDetails) {
    const storagePath = `storageInfo/${storage.id}`;
    const storageRef = ref(this.db, storagePath);
    await set(storageRef, storage);
  }

  async getStoragesForUser(userId: string): Promise<StorageDetails[]> {
    if (!userId) {
      throw 'Did not receive user id';
    }
    const storagesRef = ref(this.db, `storageInfo`);
    const snapshot = await get(storagesRef);
    if (!snapshot.exists() || !snapshot.val()) {
      return [];
    }
    const storages = Object.values(snapshot.val()) as StorageDetails[];
    return storages.filter(
      (storage) => storage.userPermissions && storage.userPermissions[userId]
    );
  }

  async addUserToStorage(
    storageId: string,
    userId: string,
    permissionDetails: UserPermissionDetails
  ) {
    const storage = await this.getStorageById(storageId);
    if (storage.userPermissions && storage.userPermissions[userId])
      throw 'User already has access to storage';

    if (!permissionDetails) {
      throw 'Permission details are required';
    }

    storage.userPermissions[userId] = permissionDetails;

    await this.editStorage(storage);
  }

  private async getStorageById(storageId: string): Promise<StorageDetails> {
    const storagePath = `storageInfo/${storageId}`;
    const storageRef = ref(this.db, storagePath);
    const snapshot = await get(storageRef);

    if (!snapshot.exists()) throw 'Storage does not exist';

    return snapshot.val() as StorageDetails;
  }

  async deleteStorage(storageId: string, userId: string) {
    const storage = await this.getStorageById(storageId);

    if (
      !storage.userPermissions ||
      !storage.userPermissions[userId] ||
      !storage.userPermissions[userId].canManageStorage
    ) {
      throw 'User does not have permission to delete this storage';
    }

    const storagePath = `storageInfo/${storageId}`;
    const itemRef = ref(this.db, storagePath);
    await set(itemRef, null);
  }
}
