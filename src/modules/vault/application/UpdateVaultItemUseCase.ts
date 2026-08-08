import { encryptSecret } from "../domain/crypto/encryptSecret";
import { VaultItem } from "../domain/VaultItem";
import { VaultRepository } from "../domain/VaultRepository";

export interface UpdateVaultItemParams {
  itemId: string;
  site: string;
  username: string;
  /** Omitido o vacío: se conserva la contraseña cifrada existente sin re-encriptarla. */
  password?: string;
  category?: string;
  masterKey: CryptoKey;
}

export class UpdateVaultItemUseCase {
  constructor(private readonly vaultRepository: VaultRepository) {}

  async execute(params: UpdateVaultItemParams): Promise<VaultItem> {
    const payload = params.password
      ? await encryptSecret(params.password, params.masterKey)
      : await this.currentEncryptedPayload(params.itemId);

    return this.vaultRepository.updateItem(params.itemId, {
      site: params.site,
      username: params.username,
      category: params.category,
      ...payload,
    });
  }

  private async currentEncryptedPayload(itemId: string) {
    const existing = await this.vaultRepository.getEncryptedItem(itemId);
    if (!existing.encryptedBlob) {
      throw new Error("No se pudo obtener la contraseña actual del sitio.");
    }
    return {
      encryptedBlob: existing.encryptedBlob,
      iv: existing.iv,
      salt: existing.salt,
      encryptionVersion: existing.encryptionVersion,
    };
  }
}
