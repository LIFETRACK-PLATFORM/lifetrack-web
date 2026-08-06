import { FinanceRepository } from "../domain/FinanceRepository";
import { HttpFinanceRepository } from "./HttpFinanceRepository";
import { MockFinanceRepository } from "./MockFinanceRepository";

export function createFinanceRepository(): FinanceRepository {
  if (process.env.NEXT_PUBLIC_API_GATEWAY_URL) {
    return new HttpFinanceRepository();
  }
  return new MockFinanceRepository();
}
