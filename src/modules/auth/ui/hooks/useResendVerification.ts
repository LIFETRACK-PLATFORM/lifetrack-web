import { useState } from "react";
import { AuthRepository } from "../../domain/AuthRepository";
import { ResendVerificationUseCase } from "../../application/ResendVerificationUseCase";

export function useResendVerification(repository: AuthRepository) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resendVerification(email: string) {
    setLoading(true);
    setError(null);
    try {
      const useCase = new ResendVerificationUseCase(repository);
      await useCase.execute(email);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo reenviar el email de verificación",
      );
    } finally {
      setLoading(false);
    }
  }

  return { loading, success, error, resendVerification };
}
