import { FinanceRepository, GetMonthlySummaryInput } from "../domain/FinanceRepository";
import { MonthlySummary } from "../domain/MonthlySummary";

export class GetMonthlySummaryUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(input: GetMonthlySummaryInput): Promise<MonthlySummary[]> {
    return this.financeRepository.getMonthlySummary(input);
  }
}
