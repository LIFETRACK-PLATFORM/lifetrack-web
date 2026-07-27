export interface RecoveryPlanSummaryDto {
  recoveryPlanId: string;
  bodyPart: string;
  injuryType: string;
  surgeryDate: string;
  status: string;
}

export interface ExerciseLogEntryDto {
  exerciseLogId: string;
  setsDone: number;
  repsDone: number;
  date: string;
}

export interface ExerciseProgressDto {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  phase: number;
  logs: ExerciseLogEntryDto[];
}

export interface AppointmentDto {
  appointmentId: string;
  recoveryPlanId: string;
  date: string;
  provider: string;
  notes?: string;
}

export interface MeasurementDto {
  measurementId: string;
  recoveryPlanId: string;
  type: string;
  value: number;
  unit: string;
  date: string;
}

export interface RecoveryProgressDto {
  recoveryPlanId: string;
  bodyPart: string;
  injuryType: string;
  surgeryDate: string;
  status: string;
  exercises: ExerciseProgressDto[];
  appointments: AppointmentDto[];
  measurements: MeasurementDto[];
  progressPhotos: unknown[];
}
