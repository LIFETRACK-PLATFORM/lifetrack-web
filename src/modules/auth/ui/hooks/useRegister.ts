import { useState } from "react";
import { RegisterData } from "../../domain/RegisterData";
import { AuthRepository } from "../../domain/AuthRepository";
import { RegisterUseCase } from "../../application/RegisterUseCase";

export function useRegister(repository: AuthRepository) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function register(name: string, email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const useCase = new RegisterUseCase(repository);
      await useCase.execute(new RegisterData({ name, email, password }));
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear la cuenta",
      );
    } finally {
      setLoading(false);
    }
  }

  return { loading, success, error, register };
}
