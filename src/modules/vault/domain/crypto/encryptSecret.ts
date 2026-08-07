import { ENCRYPTION_VERSION } from "./constants";
import { toBase64 } from "./base64";

export interface EncryptedSecret {
  encryptedBlob: string;
  iv: string;
  salt: string;
  encryptionVersion: string;
}

export async function encryptSecret(
  plaintext: string,
  masterKey: CryptoKey,
): Promise<EncryptedSecret> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const itemSalt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    masterKey,
    encoder.encode(plaintext),
  );

  return {
    encryptedBlob: toBase64(new Uint8Array(ciphertext)),
    iv: toBase64(iv),
    salt: toBase64(itemSalt),
    encryptionVersion: ENCRYPTION_VERSION,
  };
}
