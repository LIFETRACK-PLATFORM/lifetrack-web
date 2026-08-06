import { Account } from "../domain/Account";
import { Category } from "../domain/Category";
import { Transaction } from "../domain/Transaction";
import { FinanceRepository } from "../domain/FinanceRepository";

export interface FinanceOverview {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}

export class GetFinanceOverviewUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(): Promise<FinanceOverview> {
    const [accounts, categories, transactions] = await Promise.all([
      this.financeRepository.getAccounts(),
      this.financeRepository.getCategories(),
      this.financeRepository.getTransactions(),
    ]);
    return { accounts, categories, transactions };
  }
}
