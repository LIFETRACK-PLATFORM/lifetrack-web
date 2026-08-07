import {
  FinanceRepository,
  UpdateTransactionInput,
} from "../domain/FinanceRepository";
import { Transaction } from "../domain/Transaction";

export class UpdateTransactionUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(
    transactionId: string,
    input: UpdateTransactionInput,
  ): Promise<Transaction> {
    return this.financeRepository.updateTransaction(transactionId, input);
  }
}
