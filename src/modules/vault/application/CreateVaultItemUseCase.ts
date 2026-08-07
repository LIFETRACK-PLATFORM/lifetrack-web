import { encryptSecret } from "../domain/crypto/encryptSecret";
import { VaultItem } from "../domain/VaultItem";
import { VaultRepository } from "../domain/VaultRepository";

export interface CreateVaultItemParams {
  site: string;
  username: string;
  password: string;
  category?: string;
  masterKey: CryptoKey;
}

export class CreateVaultItemUseCase {
  constructor(private readonly vaultRepository: VaultRepository) {}

  async execute(params: CreateVaultItemParams): Promise<VaultItem> {
    const encrypted = await encryptSecret(params.password, params.masterKey);
    return this.vaultRepository.createItem({
      site: params.site,
      username: params.username,
      category: params.category,
      ...encrypted,
    });
  }
}
