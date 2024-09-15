import { Injectable } from '@angular/core';
import { Database, get, ref, set } from '@angular/fire/database';
import { ShareToken } from '../models/sharedToken';
import { Storage } from '../models/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private db: Database) {}

  async addStorage(storage: Storage) {
    const storagePath = `storageInfo/${storage.id}`;
    const storageRef = ref(this.db, storagePath);
    await set(storageRef, storage);
  }

  async editStorage(storage: Storage) {
    const storagePath = `storageInfo/${storage.id}`;
    const storageRef = ref(this.db, storagePath);
    await set(storageRef, storage);
  }

  async getStoragesForUser(userId: string): Promise<Storage[]> {
    if (!userId) {
      throw 'Did not receive user id';
    }
    const storagesRef = ref(this.db, `storageInfo`);
    const snapshot = await get(storagesRef);
    if (!snapshot.exists() || !snapshot.val()) {
      return [];
    }
    const storages = Object.values(snapshot.val()) as Storage[];
    return storages.filter((storage) =>
      storage.userPermissions.some((permission) => permission.userId === userId)
    );
  }

  async addShareToken(shareToken: ShareToken) {
    const storagePath = `sharedTokens/${shareToken.token}`;
    const storageRef = ref(this.db, storagePath);
    set(storageRef, shareToken);
    this.cleanUpExpiredTokens();
  }

  async validateToken(token: string): Promise<boolean> {
    const tokenRef = ref(this.db, `sharedTokens/${token}`);
    const snapshot = await get(tokenRef);

    if (!snapshot.exists()) throw 'Invalid token';
    if (snapshot.val().expirationDate < Date.now()) throw 'Token has expired';

    this.cleanUpExpiredTokens();

    return true;
  }

  async tokenExists(token: string): Promise<boolean> {
    const tokenRef = ref(this.db, `sharedTokens/${token}`);
    const snapshot = await get(tokenRef);

    return snapshot.exists();
  }

  async addUserToStorage(storageId: string, userId: string, userName: string) {
    const storage = await this.getStorageById(storageId);
    if (
      storage.userPermissions.some((permission) => permission.userId === userId)
    )
      throw 'User already has access to storage';

    storage.userPermissions.push({
      userId: userId,
      userName: userName,
      canManageStorage: false,
      canReadItems: true,
      canCreateItems: true,
      canUpdateItems: true,
      canDeleteItems: true,
    });

    await this.editStorage(storage);
  }

  async getShareTokenByToken(token: string): Promise<ShareToken> {
    const tokenRef = ref(this.db, `sharedTokens/${token}`);
    const snapshot = await get(tokenRef);

    if (!snapshot.exists()) throw 'Invalid token';

    return snapshot.val() as ShareToken;
  }

  private async getStorageById(storageId: string): Promise<Storage> {
    const storagePath = `storageInfo/${storageId}`;
    const storageRef = ref(this.db, storagePath);
    const snapshot = await get(storageRef);

    if (!snapshot.exists()) throw 'Storage does not exist';

    return snapshot.val() as Storage;
  }

  async cleanUpExpiredTokens() {
    const tokensRef = ref(this.db, `sharedTokens`);
    const snapshot = await get(tokensRef);

    if (!snapshot.exists()) return;

    const dateNow = Date.now();
    const tokens = Object.values(snapshot.val()) as ShareToken[];
    const parsedDates = tokens.map((t) =>
      new Date(t.expirationDate).getTime().toString()
    );
    console.log(parsedDates);
    const expiredTokens = tokens.filter(
      (token) => Number(token.expirationDate) < dateNow
    );
    for (const token of expiredTokens) {
      await set(ref(this.db, `sharedTokens/${token.token}`), null);
    }
  }

  async deleteStorage(storageId: string, userId: string) {
    const storage = await this.getStorageById(storageId);
    if (storage.userPermissions.length > 1) {
      storage.userPermissions = storage.userPermissions.filter(
        (permission) => permission.userId !== userId
      );
      if (
        !storage.userPermissions.some(
          (permission) => permission.canManageStorage
        )
      ) {
        storage.userPermissions.forEach(
          (permission) => (permission.canManageStorage = true)
        );
      }
      await this.editStorage(storage);
    } else {
      const storagePath = `storageInfo/${storageId}`;
      const itemRef = ref(this.db, storagePath);

      await set(itemRef, null);
    }
  }
}
