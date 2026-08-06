import { ProfileRepository } from "../domain/ProfileRepository";
import { UserProfile } from "../domain/UserProfile";

export class GetProfileUseCase {
  constructor(private readonly repository: ProfileRepository) {}

  execute(): Promise<UserProfile> {
    return this.repository.getMyProfile();
  }
}
