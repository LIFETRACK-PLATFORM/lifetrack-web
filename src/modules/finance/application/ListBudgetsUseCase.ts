import {
  FinanceRepository,
  ListBudgetsInput,
} from "../domain/FinanceRepository";
import { BudgetListItem } from "../domain/BudgetListItem";

export class ListBudgetsUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(input: ListBudgetsInput): Promise<BudgetListItem[]> {
    return this.financeRepository.listBudgets(input);
  }
}
