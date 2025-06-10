import { Injectable } from '@angular/core';
import { StorageDetails } from '../models/storageDetails';
import { UserPermissionDetails } from '../models/userPermissionDetails';

@Injectable({
  providedIn: 'root',
})
export class UserPermissionsService {
  constructor() {}

  getUserPermissionsForStorage(
    userId: string,
    storage: StorageDetails
  ): UserPermissionDetails | null {
    if (!storage || !storage.userPermissions) {
      return null;
    }
    return storage.userPermissions[userId] || null;
  }
}
