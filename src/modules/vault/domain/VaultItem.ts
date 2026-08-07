import { Entity } from "@/shared/domain/building-blocks/Entity";

interface VaultItemProps {
  site: string;
  username: string;
  encryptedBlob?: string;
  iv: string;
  salt: string;
  encryptionVersion: string;
  createdAt?: string;
  updatedAt?: string;
}

export class VaultItem extends Entity<VaultItemProps> {
  constructor(props: VaultItemProps, id: string) {
    super(props, id);
  }

  get site(): string {
    return this.props.site;
  }

  get username(): string {
    return this.props.username;
  }

  get encryptedBlob(): string | undefined {
    return this.props.encryptedBlob;
  }

  get iv(): string {
    return this.props.iv;
  }

  get salt(): string {
    return this.props.salt;
  }

  get encryptionVersion(): string {
    return this.props.encryptionVersion;
  }

  get createdAt(): string | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): string | undefined {
    return this.props.updatedAt;
  }
}
