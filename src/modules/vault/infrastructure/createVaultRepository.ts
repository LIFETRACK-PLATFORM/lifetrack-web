import { VaultRepository } from "../domain/VaultRepository";
import { HttpVaultRepository } from "./HttpVaultRepository";
import { MockVaultRepository } from "./MockVaultRepository";

export function createVaultRepository(): VaultRepository {
  if (process.env.NEXT_PUBLIC_API_GATEWAY_URL) {
    return new HttpVaultRepository();
  }
  return new MockVaultRepository();
}
