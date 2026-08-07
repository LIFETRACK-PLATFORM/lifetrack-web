import { ValueObject } from "@/shared/domain/building-blocks/ValueObject";

interface CurrentUserProps {
  userId: string;
  email: string;
  roles: string[];
  provider: string;
}

export class CurrentUser extends ValueObject<CurrentUserProps> {
  constructor(props: CurrentUserProps) {
    super(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get email(): string {
    return this.props.email;
  }

  get roles(): string[] {
    return this.props.roles;
  }

  get provider(): string {
    return this.props.provider;
  }
}
