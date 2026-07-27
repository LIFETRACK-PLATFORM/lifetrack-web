import { Entity } from "@/shared/domain/building-blocks/Entity";

interface OnboardingModuleOptionProps {
  title: string;
  titleWeb: string;
  description: string;
  descriptionWeb: string;
  icon: string;
  recommended: boolean;
  tags: string[];
  image?: string;
}

export class OnboardingModuleOption extends Entity<OnboardingModuleOptionProps> {
  constructor(props: OnboardingModuleOptionProps, id: string) {
    super(props, id);
  }

  get title(): string {
    return this.props.title;
  }

  get titleWeb(): string {
    return this.props.titleWeb;
  }

  get description(): string {
    return this.props.description;
  }

  get descriptionWeb(): string {
    return this.props.descriptionWeb;
  }

  get icon(): string {
    return this.props.icon;
  }

  get recommended(): boolean {
    return this.props.recommended;
  }

  get tags(): string[] {
    return this.props.tags;
  }

  get image(): string | undefined {
    return this.props.image;
  }
}
