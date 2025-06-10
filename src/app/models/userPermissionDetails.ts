export interface UserPermissionDetails {
  canManageStorage: boolean;
  canReadItems: boolean;
  canCreateItems: boolean;
  canUpdateItems: boolean;
  canDeleteItems: boolean;
  // userName: string; // The user's display name (still useful)
  // // TODO check if we still need userName
}

export const AllFalseUerPermissionDetails: UserPermissionDetails = {
  canManageStorage: false,
  canCreateItems: false,
  canReadItems: false,
  canUpdateItems: false,
  canDeleteItems: false,
};
