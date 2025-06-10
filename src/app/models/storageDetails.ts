import { UserPermissionDetails } from './userPermissionDetails';

export interface StorageDetails {
  id: string;
  name: string;
  createdAt: string;
  userPermissions: { [userId: string]: UserPermissionDetails };
}
