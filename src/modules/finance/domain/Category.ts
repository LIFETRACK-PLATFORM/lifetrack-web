import { Entity } from "@/shared/domain/building-blocks/Entity";

export type CategoryKind = "INCOME" | "EXPENSE";

interface CategoryProps {
  name: string;
  kind: CategoryKind;
  icon?: string;
  color?: string;
}

export class Category extends Entity<CategoryProps> {
  constructor(props: CategoryProps, id: string) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get kind(): CategoryKind {
    return this.props.kind;
  }

  get icon(): string | undefined {
    return this.props.icon;
  }

  get color(): string | undefined {
    return this.props.color;
  }
}
