import { Entity } from "@/shared/domain/building-blocks/Entity";

export type AccountType = "CASH" | "BANK" | "CARD" | "OTHER";

interface AccountProps {
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
}

export class Account extends Entity<AccountProps> {
  constructor(props: AccountProps, id: string) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get type(): AccountType {
    return this.props.type;
  }

  get currency(): string {
    return this.props.currency;
  }

  get balance(): number {
    return this.props.balance;
  }
}
