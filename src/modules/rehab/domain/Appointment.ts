import { Entity } from "@/shared/domain/building-blocks/Entity";

export type AppointmentType = "THERAPY" | "MEDICAL";

interface AppointmentProps {
  month: string;
  day: string;
  title: string;
  detail: string;
  provider: string;
  notes: string | null;
  type: AppointmentType;
  date: string;
  attended: boolean | null;
  /** Fecha (ISO) de la que se reprogramó esta cita, si corresponde. */
  rescheduledFrom: string | null;
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

  get provider(): string {
    return this.props.provider;
  }

  get notes(): string | null {
    return this.props.notes;
  }

  get type(): AppointmentType {
    return this.props.type;
  }

  get date(): string {
    return this.props.date;
  }

  get attended(): boolean | null {
    return this.props.attended;
  }

  get rescheduledFrom(): string | null {
    return this.props.rescheduledFrom;
  }
}
