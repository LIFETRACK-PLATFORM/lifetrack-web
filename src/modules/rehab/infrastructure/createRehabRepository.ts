import { RehabRepository } from "../domain/RehabRepository";
import { HttpRehabRepository } from "./HttpRehabRepository";
import { MockRehabRepository } from "./MockRehabRepository";

export function createRehabRepository(): RehabRepository {
  if (process.env.NEXT_PUBLIC_API_GATEWAY_URL) {
    return new HttpRehabRepository();
  }
  return new MockRehabRepository();
}
