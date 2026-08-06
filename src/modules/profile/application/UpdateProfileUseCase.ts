import { ProfileRepository } from "../domain/ProfileRepository";
import { UpdateProfileData } from "../domain/UpdateProfileData";
import { UserProfile } from "../domain/UserProfile";

export class UpdateProfileUseCase {
  constructor(private readonly repository: ProfileRepository) {}

  execute(data: UpdateProfileData): Promise<UserProfile> {
    return this.repository.updateMyProfile(data);
  }
}
