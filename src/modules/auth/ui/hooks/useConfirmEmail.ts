import { useState } from "react";
import { AuthRepository } from "../../domain/AuthRepository";
import { ConfirmEmailUseCase } from "../../application/ConfirmEmailUseCase";

export function useConfirmEmail(repository: AuthRepository) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmEmail(token: string) {
    setLoading(true);
    setError(null);
    try {
      const useCase = new ConfirmEmailUseCase(repository);
      await useCase.execute(token);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo confirmar el email",
      );
    } finally {
      setLoading(false);
    }
  }

  return { loading, success, error, confirmEmail };
}
