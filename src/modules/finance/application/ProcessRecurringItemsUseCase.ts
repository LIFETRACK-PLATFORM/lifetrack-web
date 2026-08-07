import { FinanceRepository } from "../domain/FinanceRepository";
import { ProcessRecurringResult } from "../domain/ProcessRecurringResult";

export class ProcessRecurringItemsUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(): Promise<ProcessRecurringResult> {
    return this.financeRepository.processRecurringItems();
  }
}
