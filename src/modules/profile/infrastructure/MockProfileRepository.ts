import { ProfileRepository } from "../domain/ProfileRepository";
import { UpdateProfileData } from "../domain/UpdateProfileData";
import { UserProfile } from "../domain/UserProfile";

export class MockProfileRepository implements ProfileRepository {
  private profile = new UserProfile(
    {
      authUserId: "mock-user",
      email: "demo@lifetrack.dev",
      displayName: "Demo User",
      firstName: "Demo",
      lastName: "User",
      avatarUrl: null,
      phone: null,
      timezone: "America/Lima",
      language: "es",
      status: "ACTIVE",
    },
    "mock-profile-1",
  );

  async getMyProfile(): Promise<UserProfile> {
    return this.profile;
  }

  async updateMyProfile(data: UpdateProfileData): Promise<UserProfile> {
    this.profile = new UserProfile(
      {
        authUserId: this.profile.authUserId,
        email: this.profile.email,
        displayName: data.displayName,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        avatarUrl: data.avatarUrl ?? null,
        phone: data.phone ?? null,
        timezone: data.timezone,
        language: data.language,
        status: this.profile.status,
      },
      this.profile.id,
    );
    return this.profile;
  }
}
