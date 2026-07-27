import { Entity } from "@/shared/domain/building-blocks/Entity";

interface ExerciseProgress {
  done: number;
  total: number;
  percent: number;
}

interface NextAppointmentSummary {
  title: string;
  detail: string;
}

interface RecoveryPhase {
  name: string;
  percent: number;
  description: string;
}

interface TodayExerciseSummary {
  id: string;
  name: string;
  detail: string;
  status: "completed" | "pending" | "urgent";
}

interface UpNextExerciseSummary {
  id: string;
  name: string;
  detail: string;
  icon: string;
  locked: boolean;
}

interface DashboardSummaryProps {
  planId: string;
  focusTitle: string;
  exerciseProgress: ExerciseProgress;
  nextAppointment: NextAppointmentSummary;
  weeklyCompliance: number;
  weeklyBars: number[];
  recoveryScore: number;
  activeMinutes: number;
  activeMinutesDelta: string;
  phase: RecoveryPhase;
  todayExercises: TodayExerciseSummary[];
  upNext: UpNextExerciseSummary[];
}

export class DashboardSummary extends Entity<DashboardSummaryProps> {
  constructor(props: DashboardSummaryProps, id: string) {
    super(props, id);
  }

  get planId(): string {
    return this.props.planId;
  }

  get focusTitle(): string {
    return this.props.focusTitle;
  }

  get exerciseProgress(): ExerciseProgress {
    return this.props.exerciseProgress;
  }

  get nextAppointment(): NextAppointmentSummary {
    return this.props.nextAppointment;
  }

  get weeklyCompliance(): number {
    return this.props.weeklyCompliance;
  }

  get weeklyBars(): number[] {
    return this.props.weeklyBars;
  }

  get recoveryScore(): number {
    return this.props.recoveryScore;
  }

  get activeMinutes(): number {
    return this.props.activeMinutes;
  }

  get activeMinutesDelta(): string {
    return this.props.activeMinutesDelta;
  }

  get phase(): RecoveryPhase {
    return this.props.phase;
  }

  get todayExercises(): TodayExerciseSummary[] {
    return this.props.todayExercises;
  }

  get upNext(): UpNextExerciseSummary[] {
    return this.props.upNext;
  }
}
