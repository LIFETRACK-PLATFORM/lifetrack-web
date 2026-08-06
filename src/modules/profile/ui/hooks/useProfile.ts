import { useEffect, useState } from "react";
import { GetProfileUseCase } from "../../application/GetProfileUseCase";
import { ProfileRepository } from "../../domain/ProfileRepository";
import { UserProfile } from "../../domain/UserProfile";

export function useProfile(repository: ProfileRepository) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });

    const getProfile = new GetProfileUseCase(repository);
    getProfile
      .execute()
      .then((fetched) => {
        if (!cancelled) setProfile(fetched);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al cargar el perfil",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  return { profile, loading, error, setProfile };
}
