import { GetCurrentUserUseCase } from "../application/GetCurrentUserUseCase";
import { AuthRepository } from "../domain/AuthRepository";
import { CurrentUser } from "../domain/CurrentUser";

let resolvedUser: CurrentUser | null = null;
let inflight: Promise<CurrentUser> | null = null;

export function resolveSession(repository: AuthRepository): Promise<CurrentUser> {
  if (resolvedUser) {
    return Promise.resolve(resolvedUser);
  }

  if (inflight) {
    return inflight;
  }

  const useCase = new GetCurrentUserUseCase(repository);
  inflight = useCase
    .execute()
    .then((user) => {
      resolvedUser = user;
      inflight = null;
      return user;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });

  return inflight;
}

export function resetSessionBootstrap(): void {
  resolvedUser = null;
  inflight = null;
}
