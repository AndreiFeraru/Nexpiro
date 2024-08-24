import { UserPermission } from './userPermission';

export interface Storage {
  id: number;
  name: string;
  createdAt: string;
  users: UserPermission[];
}
