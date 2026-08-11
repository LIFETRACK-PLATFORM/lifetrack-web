import {
  FinanceRepository,
  GetDebtsSummaryInput,
} from "../domain/FinanceRepository";
import { DebtCurrencySummary } from "../domain/DebtsSummary";

export class GetDebtsSummaryUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(input: GetDebtsSummaryInput): Promise<DebtCurrencySummary[]> {
    return this.financeRepository.getDebtsSummary(input);
  }
}
