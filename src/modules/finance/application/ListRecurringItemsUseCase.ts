import { FinanceRepository } from "../domain/FinanceRepository";
import { RecurringItem } from "../domain/RecurringItem";

export class ListRecurringItemsUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(): Promise<RecurringItem[]> {
    return this.financeRepository.getRecurringItems();
  }
}
