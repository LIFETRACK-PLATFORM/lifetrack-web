import {
  FinanceRepository,
  RegisterDebtPaymentInput,
  RegisterDebtPaymentResult,
} from "../domain/FinanceRepository";

export class RegisterDebtPaymentUseCase {
  constructor(private readonly financeRepository: FinanceRepository) {}

  async execute(
    debtId: string,
    input: RegisterDebtPaymentInput,
  ): Promise<RegisterDebtPaymentResult> {
    return this.financeRepository.registerDebtPayment(debtId, input);
  }
}
