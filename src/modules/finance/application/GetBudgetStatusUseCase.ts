import { BudgetStatus } from "../domain/BudgetStatus";
import {
  FinanceRepository,
  GetBudgetStatusInput,
} from "../domain/FinanceRepository";

export class GetBudgetStatusUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(input: GetBudgetStatusInput): Promise<BudgetStatus> {
    return this.financeRepository.getBudgetStatus(input);
  }
}
