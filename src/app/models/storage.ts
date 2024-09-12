import { UserPermission } from './userPermission';

export interface Storage {
  id: string;
  name: string;
  createdAt: string;
  userPermissions: UserPermission[];
}
