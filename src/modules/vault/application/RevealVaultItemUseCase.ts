import { decryptSecret } from "../domain/crypto/decryptSecret";
import { VaultRepository } from "../domain/VaultRepository";

export class RevealVaultItemUseCase {
  constructor(private readonly vaultRepository: VaultRepository) {}

  async execute(itemId: string, masterKey: CryptoKey): Promise<string> {
    const item = await this.vaultRepository.getEncryptedItem(itemId);
    if (!item.encryptedBlob) {
      throw new Error("El item no contiene datos cifrados.");
    }
    return decryptSecret(item.encryptedBlob, item.iv, masterKey);
  }
}
