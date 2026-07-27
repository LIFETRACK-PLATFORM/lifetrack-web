import { useState } from "react";
import { AuthRepository } from "../../domain/AuthRepository";
import { ResetPasswordUseCase } from "../../application/ResetPasswordUseCase";

export function useResetPassword(repository: AuthRepository) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resetPassword(token: string, newPassword: string) {
    setLoading(true);
    setError(null);
    try {
      const useCase = new ResetPasswordUseCase(repository);
      await useCase.execute(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo restablecer la contraseña",
      );
    } finally {
      setLoading(false);
    }
  }

  return { loading, success, error, resetPassword };
}
