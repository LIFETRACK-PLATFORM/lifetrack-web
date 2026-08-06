import { Entity } from "@/shared/domain/building-blocks/Entity";

export interface UserProfileProps {
  authUserId: string;
  email: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  timezone: string;
  language: string;
  status: string;
}

export class UserProfile extends Entity<UserProfileProps> {
  constructor(props: UserProfileProps, id?: string) {
    super(props, id);
  }

  get authUserId(): string {
    return this.props.authUserId;
  }

  get email(): string {
    return this.props.email;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get firstName(): string | null {
    return this.props.firstName;
  }

  get lastName(): string | null {
    return this.props.lastName;
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  get phone(): string | null {
    return this.props.phone;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  get language(): string {
    return this.props.language;
  }

  get status(): string {
    return this.props.status;
  }
}
