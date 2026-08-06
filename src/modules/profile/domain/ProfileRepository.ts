import { UpdateProfileData } from "./UpdateProfileData";
import { UserProfile } from "./UserProfile";

export interface ProfileRepository {
  getMyProfile(): Promise<UserProfile>;
  updateMyProfile(data: UpdateProfileData): Promise<UserProfile>;
}
