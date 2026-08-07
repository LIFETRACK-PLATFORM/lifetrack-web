import { describe, expect, it } from "vitest";
import { toBase64 } from "./base64";
import { deriveMasterKey } from "./deriveMasterKey";
import { encryptSecret } from "./encryptSecret";
import { decryptSecret } from "./decryptSecret";

describe("vault crypto", () => {
  const masterPassword = "test-master-password-123";
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const saltBase64 = toBase64(saltBytes);

  it("derives a reproducible AES-GCM key from password and salt", async () => {
    const key1 = await deriveMasterKey(masterPassword, saltBase64);
    const key2 = await deriveMasterKey(masterPassword, saltBase64);

    const raw1 = await crypto.subtle.exportKey("raw", key1);
    const raw2 = await crypto.subtle.exportKey("raw", key2);

    expect(new Uint8Array(raw1)).toEqual(new Uint8Array(raw2));
  });

  it("encrypts and decrypts a secret roundtrip", async () => {
    const masterKey = await deriveMasterKey(masterPassword, saltBase64);
    const plaintext = "super-secret-password!@#";

    const encrypted = await encryptSecret(plaintext, masterKey);
    const decrypted = await decryptSecret(
      encrypted.encryptedBlob,
      encrypted.iv,
      masterKey,
    );

    expect(decrypted).toBe(plaintext);
  });

  it("produces distinct ciphertext for the same plaintext (random IV)", async () => {
    const masterKey = await deriveMasterKey(masterPassword, saltBase64);
    const plaintext = "same-password";

    const a = await encryptSecret(plaintext, masterKey);
    const b = await encryptSecret(plaintext, masterKey);

    expect(a.encryptedBlob).not.toBe(b.encryptedBlob);
    expect(a.iv).not.toBe(b.iv);
  });

  it("fails decryption with wrong master key", async () => {
    const correctKey = await deriveMasterKey(masterPassword, saltBase64);
    const wrongSalt = toBase64(crypto.getRandomValues(new Uint8Array(16)));
    const wrongKey = await deriveMasterKey("wrong-password", wrongSalt);

    const encrypted = await encryptSecret("secret", correctKey);

    await expect(
      decryptSecret(encrypted.encryptedBlob, encrypted.iv, wrongKey),
    ).rejects.toThrow();
  });
});
