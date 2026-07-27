import { Credentials } from "../domain/Credentials";
import { RegisterData } from "../domain/RegisterData";
import { AuthRepository } from "../domain/AuthRepository";
import { CurrentUser } from "../domain/CurrentUser";

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:3000";

export class HttpAuthRepository implements AuthRepository {
  async login(credentials: Credentials): Promise<void> {
    const response = await fetch(`${API_GATEWAY_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(errorBody?.message ?? "No se pudo iniciar sesión");
    }
  }

  async register(data: RegisterData): Promise<void> {
    const response = await fetch(`${API_GATEWAY_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(errorBody?.message ?? "No se pudo crear la cuenta");
    }
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_GATEWAY_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(errorBody?.message ?? "No se pudo cerrar sesión");
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_GATEWAY_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(
        errorBody?.message ?? "No se pudo solicitar el restablecimiento",
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_GATEWAY_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(
        errorBody?.message ?? "No se pudo restablecer la contraseña",
      );
    }
  }

  async confirmEmail(token: string): Promise<void> {
    const response = await fetch(`${API_GATEWAY_URL}/auth/confirm-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(errorBody?.message ?? "No se pudo confirmar el email");
    }
  }

  async getCurrentUser(): Promise<CurrentUser> {
    const response = await fetch(`${API_GATEWAY_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("No hay sesión activa");
    }

    const data = (await response.json()) as {
      userId: string;
      email: string;
      roles: string[];
    };

    return new CurrentUser({
      userId: data.userId,
      email: data.email,
      roles: data.roles,
    });
  }
}
