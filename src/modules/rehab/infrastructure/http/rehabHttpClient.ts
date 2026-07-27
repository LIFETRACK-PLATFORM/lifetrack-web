const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:3000";

async function rehabFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
      message?: string;
    } | null;
    throw new Error(body?.message ?? `Error rehab API (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export class RehabApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function rehabFetchStrict<T>(path: string, init?: RequestInit): Promise<T> {
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
      message?: string;
    } | null;
    throw new RehabApiError(
      body?.message ?? `Error rehab API (${response.status})`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export { rehabFetch, rehabFetchStrict, API_GATEWAY_URL };
