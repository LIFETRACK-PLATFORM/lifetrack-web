export type UpdateProfileData = {
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  timezone: string;
  language: string;
};
