import { VaultItem } from "../domain/VaultItem";
import { VaultRepository } from "../domain/VaultRepository";

export class ListVaultItemsUseCase {
  constructor(private readonly vaultRepository: VaultRepository) {}

  async execute(): Promise<VaultItem[]> {
    return this.vaultRepository.listItems();
  }
}
