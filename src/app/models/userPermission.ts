export interface UserPermission {
  userId: string;
  userName: string;
  canManageStorage: boolean;
  canReadItems: boolean;
  canCreateItems: boolean;
  canUpdateItems: boolean;
  canDeleteItems: boolean;
  [key: string]: boolean | string;
}
