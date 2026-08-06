const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
if (!API_GATEWAY_URL) {
  throw new Error("NEXT_PUBLIC_API_GATEWAY_URL no está configurada");
}

export class FinanceApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function financeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_GATEWAY_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message;
    throw new FinanceApiError(
      message ?? `Error en la API de finanzas (${response.status})`,
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export { financeFetch, API_GATEWAY_URL };
