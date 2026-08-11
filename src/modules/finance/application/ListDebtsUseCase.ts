import { FinanceRepository } from "../domain/FinanceRepository";
import { Debt } from "../domain/Debt";

export class ListDebtsUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(): Promise<Debt[]> {
    return this.financeRepository.getDebts();
  }
}
