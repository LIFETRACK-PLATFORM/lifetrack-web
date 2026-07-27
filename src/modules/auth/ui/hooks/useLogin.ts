import { useState } from "react";
import { Credentials } from "../../domain/Credentials";
import { AuthRepository } from "../../domain/AuthRepository";
import { LoginUseCase } from "../../application/LoginUseCase";
import { resolveSession } from "../../infrastructure/sessionBootstrap";

// Debe coincidir con el mensaje de EmailNotVerifiedError en auth-service
// (auth.errors.ts); es la única señal disponible hoy para distinguir este
// caso del resto de errores de login, ya que el gateway no propaga códigos
// de error estructurados al frontend, solo el mensaje.
const EMAIL_NOT_VERIFIED_MESSAGE =
  "Debes confirmar tu email antes de iniciar sesión";

export function useLogin(repository: AuthRepository) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const useCase = new LoginUseCase(repository);
      await useCase.execute(new Credentials({ email, password }));
      await resolveSession(repository);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar sesión",
      );
    } finally {
      setLoading(false);
    }
  }

  const isEmailNotVerified = error === EMAIL_NOT_VERIFIED_MESSAGE;

  return { loading, success, error, isEmailNotVerified, login };
}
