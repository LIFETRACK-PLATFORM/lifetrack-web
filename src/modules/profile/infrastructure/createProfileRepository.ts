import { ProfileRepository } from "../domain/ProfileRepository";
import { HttpProfileRepository } from "./HttpProfileRepository";
import { MockProfileRepository } from "./MockProfileRepository";

export function createProfileRepository(): ProfileRepository {
  if (process.env.NEXT_PUBLIC_API_GATEWAY_URL) {
    return new HttpProfileRepository();
  }
  return new MockProfileRepository();
}
