import { UserPermission } from './userPermission';

export interface Fridge {
  id: number;
  name: string;
  createdAt: string;
  users: UserPermission[];
}
