import { Credentials } from "../domain/Credentials";
import { RegisterData } from "../domain/RegisterData";
import { AuthRepository } from "../domain/AuthRepository";
import { CurrentUser } from "../domain/CurrentUser";

export class MockAuthRepository implements AuthRepository {
  simulateSession = true;

  async login(_credentials: Credentials): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
  }

  async register(_data: RegisterData): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
  }

  async logout(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
  }

  async forgotPassword(_email: string): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
  }

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
  }

  async confirmEmail(_token: string): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
  }

  async getCurrentUser(): Promise<CurrentUser> {
    await new Promise<void>((resolve) => setTimeout(resolve, 800));

    if (!this.simulateSession) {
      throw new Error("No hay sesión activa");
    }

    return new CurrentUser({
      userId: "mock-user-1",
      email: "usuario@lifetrack.dev",
      roles: ["USER"],
    });
  }
}
