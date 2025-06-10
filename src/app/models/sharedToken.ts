import { UserPermissionDetails } from './userPermissionDetails';

export interface ShareToken {
  token: string;
  expirationDate: string;
  createdAt: string;
  storageId: string;
  storageName: string;
  sharedByUserName: string;
  permissions?: UserPermissionDetails;
}
