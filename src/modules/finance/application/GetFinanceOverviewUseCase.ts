import { FinanceRepository, TransactionFilters } from "../domain/FinanceRepository";
import { Account } from "../domain/Account";
import { Category } from "../domain/Category";
import { Transaction } from "../domain/Transaction";

export interface FinanceOverview {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}

export interface FinanceOverviewFilters extends TransactionFilters {}

export class GetFinanceOverviewUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(filters?: FinanceOverviewFilters): Promise<FinanceOverview> {
    const [accounts, categories, transactions] = await Promise.all([
      this.financeRepository.getAccounts(),
      this.financeRepository.getCategories(),
      this.financeRepository.getTransactions(filters),
    ]);
    return { accounts, categories, transactions };
  }
}
