import { VaultItem } from "./VaultItem";

export interface CreateVaultItemInput {
  site: string;
  username: string;
  category?: string;
  encryptedBlob: string;
  iv: string;
  salt: string;
  encryptionVersion: string;
}

export interface UpdateVaultItemInput {
  site: string;
  username: string;
  category?: string;
  encryptedBlob: string;
  iv: string;
  salt: string;
  encryptionVersion: string;
}

export interface VaultRepository {
  getOrCreateSalt(): Promise<{ salt: string }>;
  listItems(): Promise<VaultItem[]>;
  createItem(input: CreateVaultItemInput): Promise<VaultItem>;
  getEncryptedItem(itemId: string): Promise<VaultItem>;
  updateItem(itemId: string, input: UpdateVaultItemInput): Promise<VaultItem>;
  deleteItem(itemId: string): Promise<void>;
}
