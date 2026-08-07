import { deriveMasterKey } from "../domain/crypto/deriveMasterKey";
import { VaultRepository } from "../domain/VaultRepository";

export class SetupOrUnlockVaultUseCase {
  constructor(private readonly vaultRepository: VaultRepository) {}

  async execute(masterPassword: string): Promise<CryptoKey> {
    const { salt } = await this.vaultRepository.getOrCreateSalt();
    return deriveMasterKey(masterPassword, salt);
  }
}
