const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
if (!API_GATEWAY_URL) {
  throw new Error("NEXT_PUBLIC_API_GATEWAY_URL no está configurada");
}

export function oauthStartUrl(provider: "google" | "github"): string {
  return `${API_GATEWAY_URL}/auth/${provider}`;
}
