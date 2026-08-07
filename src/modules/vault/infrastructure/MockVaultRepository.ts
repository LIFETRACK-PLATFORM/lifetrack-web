import { toBase64 } from "../domain/crypto/base64";
import { VaultItem } from "../domain/VaultItem";
import { DEFAULT_VAULT_CATEGORY } from "../domain/vaultCategories";
import {
  CreateVaultItemInput,
  UpdateVaultItemInput,
  VaultRepository,
} from "../domain/VaultRepository";

const mockSaltBytes = crypto.getRandomValues(new Uint8Array(16));
const mockSalt = toBase64(mockSaltBytes);

interface StoredVaultItem {
  id: string;
  site: string;
  username: string;
  category: string;
  encryptedBlob: string;
  iv: string;
  salt: string;
  encryptionVersion: string;
  createdAt: string;
  updatedAt: string;
}

const items: StoredVaultItem[] = [];

export class MockVaultRepository implements VaultRepository {
  async getOrCreateSalt(): Promise<{ salt: string }> {
    return { salt: mockSalt };
  }

  async listItems(): Promise<VaultItem[]> {
    return items.map(
      (item) =>
        new VaultItem(
          {
            site: item.site,
            username: item.username,
            category: item.category,
            iv: item.iv,
            salt: item.salt,
            encryptionVersion: item.encryptionVersion,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          },
          item.id,
        ),
    );
  }

  async createItem(input: CreateVaultItemInput): Promise<VaultItem> {
    const now = new Date().toISOString();
    const stored: StoredVaultItem = {
      id: crypto.randomUUID(),
      site: input.site,
      username: input.username,
      category: input.category ?? DEFAULT_VAULT_CATEGORY,
      encryptedBlob: input.encryptedBlob,
      iv: input.iv,
      salt: input.salt,
      encryptionVersion: input.encryptionVersion,
      createdAt: now,
      updatedAt: now,
    };
    items.push(stored);
    return new VaultItem(
      {
        site: stored.site,
        username: stored.username,
        category: stored.category,
        encryptedBlob: stored.encryptedBlob,
        iv: stored.iv,
        salt: stored.salt,
        encryptionVersion: stored.encryptionVersion,
        createdAt: stored.createdAt,
        updatedAt: stored.updatedAt,
      },
      stored.id,
    );
  }

  async getEncryptedItem(itemId: string): Promise<VaultItem> {
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      throw new Error("Item de bóveda no encontrado.");
    }
    return new VaultItem(
      {
        site: item.site,
        username: item.username,
        category: item.category,
        encryptedBlob: item.encryptedBlob,
        iv: item.iv,
        salt: item.salt,
        encryptionVersion: item.encryptionVersion,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
      item.id,
    );
  }

  async updateItem(
    itemId: string,
    input: UpdateVaultItemInput,
  ): Promise<VaultItem> {
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx < 0) {
      throw new Error("Item de bóveda no encontrado.");
    }
    const updated: StoredVaultItem = {
      ...items[idx]!,
      site: input.site,
      username: input.username,
      category: input.category ?? items[idx]!.category,
      encryptedBlob: input.encryptedBlob,
      iv: input.iv,
      salt: input.salt,
      encryptionVersion: input.encryptionVersion,
      updatedAt: new Date().toISOString(),
    };
    items[idx] = updated;
    return new VaultItem(
      {
        site: updated.site,
        username: updated.username,
        category: updated.category,
        encryptedBlob: updated.encryptedBlob,
        iv: updated.iv,
        salt: updated.salt,
        encryptionVersion: updated.encryptionVersion,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
      updated.id,
    );
  }

  async deleteItem(itemId: string): Promise<void> {
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx >= 0) items.splice(idx, 1);
  }
}
