import { VaultItem } from "../domain/VaultItem";
import {
  CreateVaultItemInput,
  UpdateVaultItemInput,
  VaultRepository,
} from "../domain/VaultRepository";
import { vaultFetch } from "./http/vaultHttpClient";

interface VaultItemSummaryDto {
  vaultItemId: string;
  site: string;
  username: string;
  encryptionVersion: string;
  createdAt: string;
  updatedAt: string;
}

interface VaultItemDto {
  vaultItemId: string;
  site: string;
  username: string;
  encryptedBlob?: string;
  iv: string;
  salt: string;
  encryptionVersion: string;
  createdAt?: string;
  updatedAt?: string;
}

function toVaultItem(dto: VaultItemDto): VaultItem {
  return new VaultItem(
    {
      site: dto.site,
      username: dto.username,
      encryptedBlob: dto.encryptedBlob,
      iv: dto.iv,
      salt: dto.salt,
      encryptionVersion: dto.encryptionVersion,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    },
    dto.vaultItemId,
  );
}

function summaryToVaultItem(dto: VaultItemSummaryDto): VaultItem {
  return new VaultItem(
    {
      site: dto.site,
      username: dto.username,
      iv: "",
      salt: "",
      encryptionVersion: dto.encryptionVersion,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    },
    dto.vaultItemId,
  );
}

export class HttpVaultRepository implements VaultRepository {
  async getOrCreateSalt(): Promise<{ salt: string }> {
    return vaultFetch<{ salt: string }>("/vault/salt");
  }

  async listItems(): Promise<VaultItem[]> {
    const { items } = await vaultFetch<{ items: VaultItemSummaryDto[] }>(
      "/vault/items",
    );
    return items.map(summaryToVaultItem);
  }

  async createItem(input: CreateVaultItemInput): Promise<VaultItem> {
    const dto = await vaultFetch<VaultItemDto>("/vault/items", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return toVaultItem(dto);
  }

  async getEncryptedItem(itemId: string): Promise<VaultItem> {
    const dto = await vaultFetch<VaultItemDto>(`/vault/items/${itemId}`);
    return toVaultItem(dto);
  }

  async updateItem(
    itemId: string,
    input: UpdateVaultItemInput,
  ): Promise<VaultItem> {
    const dto = await vaultFetch<VaultItemDto>(`/vault/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return toVaultItem(dto);
  }

  async deleteItem(itemId: string): Promise<void> {
    await vaultFetch(`/vault/items/${itemId}`, { method: "DELETE" });
  }
}
