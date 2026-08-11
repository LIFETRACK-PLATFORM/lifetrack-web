import {
  FinanceRepository,
  RecurringCandidate,
} from "../domain/FinanceRepository";

export class DetectRecurringCandidatesUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(): Promise<RecurringCandidate[]> {
    return this.financeRepository.detectRecurringCandidates();
  }
}
