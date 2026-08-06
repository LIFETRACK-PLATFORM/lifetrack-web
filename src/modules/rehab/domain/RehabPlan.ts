import { Entity } from "@/shared/domain/building-blocks/Entity";
import { Exercise } from "./Exercise";
import { Appointment } from "./Appointment";

interface PlanMetrics {
  kneeExtensionNote: string;
  painLevel: string;
}

interface RehabPlanProps {
  titleMobile: string;
  titleWeb: string;
  phaseLabel: string;
  dayProgress: string;
  weekLabel: string;
  statusMessage: string;
  remainingToday: number;
  exercises: Exercise[];
  appointments: Appointment[];
  metrics: PlanMetrics;
  weeklyCompliancePercent: number;
  streakDays: number;
  completedTodayCount: number;
  scheduledTodayCount: number;
}

export class RehabPlan extends Entity<RehabPlanProps> {
  constructor(props: RehabPlanProps, id: string) {
    super(props, id);
  }

  get titleMobile(): string {
    return this.props.titleMobile;
  }

  get titleWeb(): string {
    return this.props.titleWeb;
  }

  get phaseLabel(): string {
    return this.props.phaseLabel;
  }

  get dayProgress(): string {
    return this.props.dayProgress;
  }

  get weekLabel(): string {
    return this.props.weekLabel;
  }

  get statusMessage(): string {
    return this.props.statusMessage;
  }

  get remainingToday(): number {
    return this.props.remainingToday;
  }

  get exercises(): Exercise[] {
    return this.props.exercises;
  }

  get appointments(): Appointment[] {
    return this.props.appointments;
  }

  get metrics(): PlanMetrics {
    return this.props.metrics;
  }

  get weeklyCompliancePercent(): number {
    return this.props.weeklyCompliancePercent;
  }

  get streakDays(): number {
    return this.props.streakDays;
  }

  get completedTodayCount(): number {
    return this.props.completedTodayCount;
  }

  get scheduledTodayCount(): number {
    return this.props.scheduledTodayCount;
  }
}
