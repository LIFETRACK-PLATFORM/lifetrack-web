import { VaultRepository } from "../domain/VaultRepository";

export class DeleteVaultItemUseCase {
  constructor(private readonly vaultRepository: VaultRepository) {}

  async execute(itemId: string): Promise<void> {
    return this.vaultRepository.deleteItem(itemId);
  }
}
