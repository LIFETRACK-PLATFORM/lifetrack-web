import { ValueObject } from "@/shared/domain/building-blocks/ValueObject";

interface RegisterDataProps {
  name: string;
  email: string;
  password: string;
}

export class RegisterData extends ValueObject<RegisterDataProps> {
  constructor(props: RegisterDataProps) {
    super(props);
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }
}
