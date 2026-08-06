import { ProfileRepository } from "../domain/ProfileRepository";
import { UpdateProfileData } from "../domain/UpdateProfileData";
import { UserProfile } from "../domain/UserProfile";
import {
  mapUserProfileDto,
  type UserProfileDto,
} from "./mappers/UserProfileMapper";

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
if (!API_GATEWAY_URL) {
  throw new Error("NEXT_PUBLIC_API_GATEWAY_URL no está configurada");
}

async function profileFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_GATEWAY_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      body?.message ?? `Error en la API de perfil (${response.status})`,
    );
  }

  return response.json() as Promise<T>;
}

export class HttpProfileRepository implements ProfileRepository {
  async getMyProfile(): Promise<UserProfile> {
    const dto = await profileFetch<UserProfileDto>("/users/me");
    return mapUserProfileDto(dto);
  }

  async updateMyProfile(data: UpdateProfileData): Promise<UserProfile> {
    const dto = await profileFetch<UserProfileDto>("/users/me", {
      method: "PATCH",
      body: JSON.stringify({
        displayName: data.displayName,
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        avatarUrl: data.avatarUrl ?? "",
        phone: data.phone ?? "",
        timezone: data.timezone,
        language: data.language,
      }),
    });
    return mapUserProfileDto(dto);
  }
}
