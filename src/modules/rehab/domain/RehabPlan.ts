import { Entity } from "@/shared/domain/building-blocks/Entity";
import { Exercise } from "./Exercise";
import { Appointment } from "./Appointment";
import type { MeasurementType, RecoveryPlanStatus } from "./RehabRepository";

interface PlanMetrics {
  kneeExtensionNote: string;
  painLevel: string;
}

export interface PainLogPoint {
  date: string;
  level: number;
  note?: string;
}

export interface WeeklyDayPoint {
  date: string;
  due: number;
  completed: number;
  compliant: boolean;
  isFuture: boolean;
}

export interface MeasurementPoint {
  measurementId: string;
  type: MeasurementType;
  customLabel?: string;
  value: number;
  unit: string;
  date: string;
}

interface RehabPlanProps {
  titleMobile: string;
  titleWeb: string;
  phaseLabel: string;
  dayProgress: string;
  weekLabel: string;
  statusMessage: string;
  status: RecoveryPlanStatus;
  remainingToday: number;
  exercises: Exercise[];
  appointments: Appointment[];
  metrics: PlanMetrics;
  painHistory: PainLogPoint[];
  measurements: MeasurementPoint[];
  weeklyDays: WeeklyDayPoint[];
  weeklyCompliancePercent: number;
  weekStart?: string;
  weekEnd?: string;
  streakDays: number;
  completedTodayCount: number;
  scheduledTodayCount: number;
  /** targetDate ISO → sourceDate ISO (rutina prestada persistida en DB) */
  adHocProtocolDays: Record<string, string>;
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

  get status(): RecoveryPlanStatus {
    return this.props.status;
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

  get painHistory(): PainLogPoint[] {
    return this.props.painHistory;
  }

  get measurements(): MeasurementPoint[] {
    return this.props.measurements;
  }

  get weeklyDays(): WeeklyDayPoint[] {
    return this.props.weeklyDays;
  }

  get weeklyCompliancePercent(): number {
    return this.props.weeklyCompliancePercent;
  }

  get weekStart(): string | undefined {
    return this.props.weekStart;
  }

  get weekEnd(): string | undefined {
    return this.props.weekEnd;
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

  get adHocProtocolDays(): Record<string, string> {
    return this.props.adHocProtocolDays;
  }
}
