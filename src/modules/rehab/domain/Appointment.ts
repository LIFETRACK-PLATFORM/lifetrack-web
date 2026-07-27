import { Entity } from "@/shared/domain/building-blocks/Entity";

interface AppointmentProps {
  month: string;
  day: string;
  title: string;
  detail: string;
}

export class Appointment extends Entity<AppointmentProps> {
  constructor(props: AppointmentProps, id: string) {
    super(props, id);
  }

  get month(): string {
    return this.props.month;
  }

  get day(): string {
    return this.props.day;
  }

  get title(): string {
    return this.props.title;
  }

  get detail(): string {
    return this.props.detail;
  }
}
