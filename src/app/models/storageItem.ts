export interface StorageItem {
  id: string;
  name: string;
  description: string | undefined;
  expirationDate: string;
  createdAt: string;
  lastModified: string;
  lastModifiedBy: string;
}
