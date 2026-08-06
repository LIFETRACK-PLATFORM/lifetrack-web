import { Entity } from "@/shared/domain/building-blocks/Entity";

export type TransactionKind = "INCOME" | "EXPENSE";

interface TransactionProps {
  accountId: string;
  categoryId: string;
  amount: number;
  kind: TransactionKind;
  description?: string;
  occurredAt: string;
  accountBalanceAfter: number;
  budgetExceeded: boolean;
}

export class Transaction extends Entity<TransactionProps> {
  constructor(props: TransactionProps, id: string) {
    super(props, id);
  }

  get accountId(): string {
    return this.props.accountId;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get kind(): TransactionKind {
    return this.props.kind;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get occurredAt(): string {
    return this.props.occurredAt;
  }

  get accountBalanceAfter(): number {
    return this.props.accountBalanceAfter;
  }

  get budgetExceeded(): boolean {
    return this.props.budgetExceeded;
  }
}
