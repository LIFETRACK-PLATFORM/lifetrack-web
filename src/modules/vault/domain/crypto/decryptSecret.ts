import { fromBase64 } from "./base64";

export async function decryptSecret(
  encryptedBlob: string,
  iv: string,
  masterKey: CryptoKey,
): Promise<string> {
  const ciphertext = new Uint8Array(fromBase64(encryptedBlob));
  const ivBytes = new Uint8Array(fromBase64(iv));

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    masterKey,
    ciphertext,
  );

  return new TextDecoder().decode(plaintext);
}
