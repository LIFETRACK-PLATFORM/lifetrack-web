import { Entity } from "@/shared/domain/building-blocks/Entity";

export type ExerciseMetricType = "REPS" | "DURATION";

interface ExerciseProps {
  name: string;
  detail: string;
  icon: string;
  current: number;
  target: number;
  completed: boolean;
  metricType: ExerciseMetricType;
  targetDurationMinutes: number | null;
  notes: string | null;
  sets: number;
  reps: number;
  image: string;
  daysOfWeek: number[];
  scheduledToday: boolean;
  completedToday: boolean;
  urgent: boolean;
}

export class Exercise extends Entity<ExerciseProps> {
  constructor(props: ExerciseProps, id: string) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get detail(): string {
    return this.props.detail;
  }

  get icon(): string {
    return this.props.icon;
  }

  get current(): number {
    return this.props.current;
  }

  get target(): number {
    return this.props.target;
  }

  get completed(): boolean {
    return this.props.completed;
  }

  get metricType(): ExerciseMetricType {
    return this.props.metricType;
  }

  get targetDurationMinutes(): number | null {
    return this.props.targetDurationMinutes;
  }

  get notes(): string | null {
    return this.props.notes;
  }

  get sets(): number {
    return this.props.sets;
  }

  get reps(): number {
    return this.props.reps;
  }

  get image(): string {
    return this.props.image;
  }

  get daysOfWeek(): number[] {
    return this.props.daysOfWeek;
  }

  get scheduledToday(): boolean {
    return this.props.scheduledToday;
  }

  get completedToday(): boolean {
    return this.props.completedToday;
  }

  get urgent(): boolean {
    return this.props.urgent;
  }
}
