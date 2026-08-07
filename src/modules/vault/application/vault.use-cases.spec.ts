import { describe, expect, it } from "vitest";
import { ListVaultItemsUseCase } from "./ListVaultItemsUseCase";
import { SetupOrUnlockVaultUseCase } from "./SetupOrUnlockVaultUseCase";
import { MockVaultRepository } from "../infrastructure/MockVaultRepository";

describe("vault application use cases", () => {
  it("SetupOrUnlockVaultUseCase deriva una CryptoKey a partir del salt", async () => {
    const repository = new MockVaultRepository();
    const useCase = new SetupOrUnlockVaultUseCase(repository);

    const masterKey = await useCase.execute("master-password-test");

    expect(masterKey).toBeDefined();
    expect(masterKey.type).toBe("secret");
    expect(masterKey.algorithm.name).toBe("AES-GCM");
  });

  it("ListVaultItemsUseCase lista items sin exponer encryptedBlob en el listado", async () => {
    const repository = new MockVaultRepository();
    await repository.createItem({
      site: "github.com",
      username: "dev",
      encryptedBlob: "blob-cifrado",
      iv: "iv-base64",
      salt: "salt-base64",
      encryptionVersion: "v1",
    });

    const useCase = new ListVaultItemsUseCase(repository);
    const items = await useCase.execute();

    expect(items).toHaveLength(1);
    expect(items[0]?.site).toBe("github.com");
    expect(items[0]?.username).toBe("dev");
    expect(items[0]?.encryptedBlob).toBeUndefined();
  });
});
