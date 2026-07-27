import { useState } from "react";
import { AuthRepository } from "../../domain/AuthRepository";
import { ForgotPasswordUseCase } from "../../application/ForgotPasswordUseCase";

export function useForgotPassword(repository: AuthRepository) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestReset(email: string) {
    setLoading(true);
    setError(null);
    try {
      const useCase = new ForgotPasswordUseCase(repository);
      await useCase.execute(email);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo solicitar el restablecimiento",
      );
    } finally {
      setLoading(false);
    }
  }

  return { loading, success, error, requestReset };
}
