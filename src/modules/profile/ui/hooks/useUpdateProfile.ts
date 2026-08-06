import { useState } from "react";
import { UpdateProfileUseCase } from "../../application/UpdateProfileUseCase";
import { ProfileRepository } from "../../domain/ProfileRepository";
import { UpdateProfileData } from "../../domain/UpdateProfileData";
import { UserProfile } from "../../domain/UserProfile";

export function useUpdateProfile(repository: ProfileRepository) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(
    data: UpdateProfileData,
  ): Promise<UserProfile | null> {
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const useCase = new UpdateProfileUseCase(repository);
      const updated = await useCase.execute(data);
      setSuccess(true);
      return updated;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el perfil",
      );
      return null;
    } finally {
      setSaving(false);
    }
  }

  return { saving, success, error, update, setSuccess };
}
