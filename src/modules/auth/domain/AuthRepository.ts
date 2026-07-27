import { Credentials } from "./Credentials";
import { RegisterData } from "./RegisterData";
import { CurrentUser } from "./CurrentUser";

export interface AuthRepository {
  login(credentials: Credentials): Promise<void>;
  register(data: RegisterData): Promise<void>;
  logout(): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  confirmEmail(token: string): Promise<void>;
  getCurrentUser(): Promise<CurrentUser>;
}
