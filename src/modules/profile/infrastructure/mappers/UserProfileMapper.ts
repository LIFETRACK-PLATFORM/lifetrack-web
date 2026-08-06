import { UserProfile } from "../../domain/UserProfile";

export type UserProfileDto = {
  id: string;
  authUserId: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  phone: string;
  timezone: string;
  language: string;
  status: string;
};

export function mapUserProfileDto(dto: UserProfileDto): UserProfile {
  return new UserProfile(
    {
      authUserId: dto.authUserId,
      email: dto.email,
      displayName: dto.displayName,
      firstName: dto.firstName || null,
      lastName: dto.lastName || null,
      avatarUrl: dto.avatarUrl || null,
      phone: dto.phone || null,
      timezone: dto.timezone,
      language: dto.language,
      status: dto.status,
    },
    dto.id,
  );
}
