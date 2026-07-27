import { ValueObject } from "@/shared/domain/building-blocks/ValueObject";

interface CredentialsProps {
  email: string;
  password: string;
}

export class Credentials extends ValueObject<CredentialsProps> {
  constructor(props: CredentialsProps) {
    super(props);
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }
}
