import { encryptSecret } from "../domain/crypto/encryptSecret";
import { VaultItem } from "../domain/VaultItem";
import { VaultRepository } from "../domain/VaultRepository";

export interface UpdateVaultItemParams {
  itemId: string;
  site: string;
  username: string;
  password: string;
  masterKey: CryptoKey;
}

export class UpdateVaultItemUseCase {
  constructor(private readonly vaultRepository: VaultRepository) {}

  async execute(params: UpdateVaultItemParams): Promise<VaultItem> {
    const encrypted = await encryptSecret(params.password, params.masterKey);
    return this.vaultRepository.updateItem(params.itemId, {
      site: params.site,
      username: params.username,
      ...encrypted,
    });
  }
}
