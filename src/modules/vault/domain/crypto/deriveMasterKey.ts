import { PBKDF2_ITERATIONS } from "./constants";
import { fromBase64 } from "./base64";

export async function deriveMasterKey(
  masterPassword: string,
  saltBase64: string,
): Promise<CryptoKey> {
  const salt = new Uint8Array(fromBase64(saltBase64));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}
