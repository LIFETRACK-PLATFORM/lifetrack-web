import { DashboardSummary } from "../domain/DashboardSummary";
import { RehabPlan } from "../domain/RehabPlan";
import { Exercise } from "../domain/Exercise";
import { Appointment } from "../domain/Appointment";
import {
  addDaysToIso,
  getProtocolStatsForDate,
  sumRepsForDate,
  startOfWeekIso,
  todayDateIso,
} from "../domain/protocolSchedule";
import {
  AddAppointmentInput,
  AddExerciseInput,
  AddMeasurementInput,
  AddPainLogInput,
  DashboardBundle,
  GetPlanOptions,
  RecoveryPlanStatus,
  RehabRepository,
  UpdateMeasurementInput,
} from "../domain/RehabRepository";
import type { WeeklyDayPoint } from "../domain/RehabPlan";

const MOCK_EXERCISE_IMAGE =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400";

const dashboard = new DashboardSummary(
  {
    planId: "acl-recovery",
    focusTitle: "Resiliencia lumbar",
    exerciseProgress: { done: 4, total: 6, percent: 66 },
    nextAppointment: {
      title: "Próximo chequeo médico",
      detail: "Fisioterapia • Mañana, 09:30 a. m.",
    },
    weeklyCompliance: 92,
    weeklyBars: [80, 95, 70, 100, 90, 30, 20],
    recoveryScore: 84,
    streakDays: 5,
    phase: {
      name: "Fase 2: Fuerza",
      percent: 75,
      description:
        "Enfocado en carga excéntrica y control neuromuscular. Te quedan 12 días en esta fase antes de la evaluación.",
    },
    todayExercises: [
      {
        id: "ex-1",
        name: "Rotaciones con banda de resistencia",
        detail: "3 series × 15 repeticiones",
        status: "completed",
      },
      {
        id: "ex-2",
        name: "Subidas con peso",
        detail: "4 series × 10 repeticiones",
        status: "pending",
      },
      {
        id: "ex-3",
        name: "Sentadilla estática en pared",
        detail: "2 series × 45 segundos",
        status: "urgent",
      },
    ],
    upNext: [
      {
        id: "next-1",
        name: "Extensión Bird-Dog",
        detail: "3 series • 12 repeticiones",
        icon: "accessibility_new",
        locked: false,
      },
      {
        id: "next-2",
        name: "Inclinaciones pélvicas",
        detail: "2 series • 15 repeticiones",
        icon: "self_improvement",
        locked: true,
      },
    ],
  },
  "current",
);

const plans: Record<string, RehabPlan> = {
  "acl-recovery": new RehabPlan(
    {
      titleMobile: "Recuperación post-operatoria de LCA",
      titleWeb: "Recuperación de LCA de rodilla",
      phaseLabel: "Fase II: Carga",
      dayProgress: "Día 14/30",
      weekLabel: "Semana 6 de 12 • Fase 2: Movilidad y fortalecimiento",
      statusMessage: "Progresando según lo planeado",
      status: "ACTIVE",
      remainingToday: 3,
      weeklyDays: [
        { date: "2026-08-02", due: 2, completed: 2, compliant: true, isFuture: false },
        { date: "2026-08-03", due: 3, completed: 3, compliant: true, isFuture: false },
        { date: "2026-08-04", due: 2, completed: 1, compliant: false, isFuture: false },
        { date: "2026-08-05", due: 3, completed: 3, compliant: true, isFuture: false },
        { date: "2026-08-06", due: 2, completed: 2, compliant: true, isFuture: false },
        { date: "2026-08-07", due: 3, completed: 1, compliant: false, isFuture: false },
        { date: "2026-08-08", due: 2, completed: 0, compliant: false, isFuture: true },
      ],
      weeklyCompliancePercent: 92,
      streakDays: 5,
      completedTodayCount: 1,
      scheduledTodayCount: 4,
      adHocProtocolDays: {},
      exercises: [
        new Exercise(
          {
            name: "Contracciones de cuádriceps (isométrico)",
            detail: "Mantener 10 s • 10 repeticiones",
            icon: "fitness_center",
            current: 8,
            target: 10,
            completed: false,
            metricType: "REPS",
            targetDurationMinutes: null,
            notes: null,
            sets: 3,
            reps: 15,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAarTEW0pmSQ0_-4zhv_22QG9m6MOOC6WcChAeiI16MYrP3ik7bdP4jTINGvuwDfto9EGtK5pNRTcXMx4uamyzd_jntN4QBThkX6ASZiStIA2odrcuorwqhSR-6qWVixw93GKunSm6sSkyXNhoukmzfpFw7G7rKMpK2hoYjP21oV6sBhe9ZPKcdpHFt7aCfVutXWdnH9WmCdtC5-LHmYYnKIB7w0TnAaVRvCZKFfvnm_vFzaWK8feHQpA",
            daysOfWeek: [],
            completions: [],
            logs: [],
            scheduledToday: true,
            completedToday: false,
            urgent: false,
          },
          "quad-sets",
        ),
        new Exercise(
          {
            name: "Bombeo de tobillo",
            detail: "Continuo • 20 repeticiones",
            icon: "directions_walk",
            current: 15,
            target: 20,
            completed: false,
            metricType: "REPS",
            targetDurationMinutes: null,
            notes: null,
            sets: 2,
            reps: 10,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCcdc34GK0rS-iIDGl2eMNYg8sVM7MH642Um9DnnNxtwcA1Xl2ftt0TOFbgFzwcz2i_KUFpWoOtvBHp7417YSPzX1U1Y6TJhKWEwsF1p9UFLiSKmMeAoYvJ6SOjiTWNrwyOnJRIjA6pETUQafUtGOQxDW19tTSDALmGkpFI5-lnNRzs6o27wnxrjnZIvIPe_Eh29HC_8bscTAsNTKexwEMr9zFv89ghwKp41a320aLBBne1cB7wBQgtqg",
            daysOfWeek: [1, 3, 5],
            completions: [],
            logs: [],
            scheduledToday: false,
            completedToday: false,
            urgent: false,
          },
          "ankle-pumps",
        ),
        new Exercise(
          {
            name: "Elevaciones de pierna recta",
            detail: "10 repeticiones • 3 series",
            icon: "check_circle",
            current: 10,
            target: 10,
            completed: true,
            metricType: "REPS",
            targetDurationMinutes: null,
            notes: null,
            sets: 3,
            reps: 12,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAf_46SdyqTYUqWaQ4aLdBI5aEVEng_vX6_gEA2uzS9xfjd4io5jHwukBeg8j7RR3mr2SsgkpWSZig6fuV3KBNZ_NOH94yw5WNEdDD259FrYxosJ5sVMBrZ1DLxO5emmh2Ccm62sKTIUYpZrv62OnDNILY5sKQVRBr8IOXrx40vZqDx_6mJuIh6YaKZXiNCMp5iE4rI7HK_GPP5HndU5OX7k9O6wKPGKu2v27sUwOnA68gwl33pV0QMmA",
            daysOfWeek: [],
            completions: [todayDateIso()],
            logs: [],
            scheduledToday: true,
            completedToday: true,
            urgent: false,
          },
          "slr",
        ),
        new Exercise(
          {
            name: "Contracciones de glúteos",
            detail: "Mantener 5 s • 15 repeticiones",
            icon: "fitness_center",
            current: 0,
            target: 15,
            completed: false,
            metricType: "REPS",
            targetDurationMinutes: null,
            notes: null,
            sets: 3,
            reps: 15,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDJvQGkHp77hRxtTHqHh8-h6xhBvygNBJVsXqpktw9kgaPZh8w_okgrfIGa96irO9etdnKGXMkLqm8ldKp_JMR-sKlxJ7S-xn8LhgvYEHAxgVMlW1XV3Uo4Uve44vwtIrBE9v8aSHcqTpgj5mzSmry2r7QX0QNlbibR9_CZWBPR5O590WpOLdrhOTwhMXAcVVt4FKC5OYjaNxGlbrHi_zFz3oA8v_UbeHU8e5uNvnqc8QO6fMBA_Xd_Ig",
            daysOfWeek: [2, 4],
            completions: [],
            logs: [],
            scheduledToday: false,
            completedToday: false,
            urgent: true,
          },
          "glute",
        ),
      ],
      appointments: [
        new Appointment(
          {
            month: "OCT",
            day: "24",
            title: "Evaluación de fisioterapia",
            detail: "09:00 a. m. • Centro Médico Apex",
            provider: "Centro Médico Apex",
            notes: null,
            type: "THERAPY",
            date: "2026-10-24T09:00:00.000Z",
            attended: null,
            rescheduledFrom: null,
          },
          "apt-1",
        ),
      ],
      metrics: {
        kneeExtensionNote: "+2° de mejora",
        painLevel: "3/10",
      },
      painHistory: [
        { date: "2026-07-28", level: 6 },
        { date: "2026-07-30", level: 5 },
        { date: "2026-08-02", level: 4 },
        { date: "2026-08-04", level: 4 },
        { date: "2026-08-06", level: 3 },
      ],
      measurements: [
        { measurementId: "m-ext-1", type: "EXTENSION_DEGREES", value: -2, unit: "°", date: "2026-07-28" },
        { measurementId: "m-ext-2", type: "EXTENSION_DEGREES", value: 0, unit: "°", date: "2026-08-06" },
        { measurementId: "m-weight-1", type: "WEIGHT_KG", value: 82, unit: "kg", date: "2026-07-28" },
        { measurementId: "m-weight-2", type: "WEIGHT_KG", value: 80.5, unit: "kg", date: "2026-08-06" },
        { measurementId: "m-waist-1", type: "WAIST_CM", value: 92, unit: "cm", date: "2026-07-28" },
        { measurementId: "m-waist-2", type: "WAIST_CM", value: 90, unit: "cm", date: "2026-08-06" },
      ],
    },
    "acl-recovery",
  ),
};

function clonePlan(
  plan: RehabPlan,
  overrides: Partial<{
    remainingToday: number;
    exercises: Exercise[];
    completedTodayCount: number;
    scheduledTodayCount: number;
    adHocProtocolDays: Record<string, string>;
    measurements: RehabPlan["measurements"];
    weeklyDays: WeeklyDayPoint[];
    weeklyCompliancePercent: number;
    weekStart: string;
    weekEnd: string;
  }> = {},
): RehabPlan {
  return new RehabPlan(
    {
      titleMobile: plan.titleMobile,
      titleWeb: plan.titleWeb,
      phaseLabel: plan.phaseLabel,
      dayProgress: plan.dayProgress,
      weekLabel: plan.weekLabel,
      statusMessage: plan.statusMessage,
      status: plan.status,
      remainingToday: overrides.remainingToday ?? plan.remainingToday,
      exercises: overrides.exercises ?? plan.exercises,
      appointments: plan.appointments,
      metrics: plan.metrics,
      painHistory: plan.painHistory,
      measurements: overrides.measurements ?? plan.measurements,
      weeklyDays: overrides.weeklyDays ?? plan.weeklyDays,
      weeklyCompliancePercent:
        overrides.weeklyCompliancePercent ?? plan.weeklyCompliancePercent,
      weekStart: overrides.weekStart ?? plan.weekStart,
      weekEnd: overrides.weekEnd ?? plan.weekEnd,
      streakDays: plan.streakDays,
      completedTodayCount:
        overrides.completedTodayCount ?? plan.completedTodayCount,
      scheduledTodayCount:
        overrides.scheduledTodayCount ?? plan.scheduledTodayCount,
      adHocProtocolDays: overrides.adHocProtocolDays ?? plan.adHocProtocolDays,
    },
    plan.id,
  );
}

function buildWeeklyDaysForReference(
  exercises: Exercise[],
  weekReferenceDate: string,
  todayIso: string,
): WeeklyDayPoint[] {
  const weekStart = startOfWeekIso(weekReferenceDate);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDaysToIso(weekStart, index);
    const stats = getProtocolStatsForDate(exercises, date);
    const due = stats.due;
    const completed = stats.completed;
    return {
      date,
      due,
      completed,
      compliant: due > 0 && completed === due,
      isFuture: date > todayIso,
    };
  });
}

function buildWeeklyCompliancePercent(days: WeeklyDayPoint[]): number {
  const evaluableDays = days.filter((day) => day.due > 0 && !day.isFuture);
  if (evaluableDays.length === 0) return 0;
  const compliantDays = evaluableDays.filter((day) => day.compliant).length;
  return Math.round((compliantDays / evaluableDays.length) * 100);
}

function syncPlanTodayStats(plan: RehabPlan): RehabPlan {
  const today = todayDateIso();
  const stats = getProtocolStatsForDate(plan.exercises, today);
  return clonePlan(plan, {
    remainingToday: stats.remaining,
    completedTodayCount: stats.completed,
    scheduledTodayCount: stats.due,
  });
}

function replaceExerciseInPlan(
  plan: RehabPlan,
  exerciseId: string,
  nextExercise: Exercise,
): RehabPlan {
  const exercises = plan.exercises.map((exercise) =>
    exercise.id === exerciseId ? nextExercise : exercise,
  );
  return clonePlan(plan, { exercises });
}

export class MockRehabRepository implements RehabRepository {
  async getDashboard(): Promise<DashboardBundle> {
    return { active: [dashboard], inactive: [] };
  }

  async getPlan(id: string, options?: GetPlanOptions): Promise<RehabPlan> {
    const plan = plans[id];
    if (!plan) throw new Error(`Plan no encontrado: ${id}`);
    const synced = syncPlanTodayStats(plan);
    plans[id] = synced;

    const today = todayDateIso();
    const weekReferenceDate = options?.weekReferenceDate ?? today;
    const weekStart = startOfWeekIso(weekReferenceDate);
    const weekEnd = addDaysToIso(weekStart, 6);
    const weeklyDays = buildWeeklyDaysForReference(
      synced.exercises,
      weekReferenceDate,
      today,
    );

    return clonePlan(synced, {
      weeklyDays,
      weeklyCompliancePercent: buildWeeklyCompliancePercent(weeklyDays),
      weekStart,
      weekEnd,
    });
  }

  async updateExerciseProgress(
    _planId: string,
    exerciseId: string,
    current: number,
    date?: string,
  ): Promise<void> {
    const dateOnly = (date ?? todayDateIso()).slice(0, 10);

    for (const [planId, plan] of Object.entries(plans)) {
      const existing = plan.exercises.find((exercise) => exercise.id === exerciseId);
      if (!existing) continue;

      const logsWithoutDate = existing.logs.filter(
        (log) => log.date.slice(0, 10) !== dateOnly,
      );
      const nextLogs =
        current > 0
          ? [...logsWithoutDate, { date: dateOnly, repsDone: current }]
          : logsWithoutDate;

      const nextExercise = new Exercise(
        {
          name: existing.name,
          detail: existing.detail,
          icon: existing.icon,
          current:
            dateOnly === todayDateIso()
              ? current
              : sumRepsForDate(nextLogs, todayDateIso()),
          target: existing.target,
          completed: existing.completed,
          metricType: existing.metricType,
          targetDurationMinutes: existing.targetDurationMinutes,
          notes: existing.notes,
          sets: existing.sets,
          reps: existing.reps,
          image: existing.image,
          daysOfWeek: existing.daysOfWeek,
          completions: existing.completions,
          logs: nextLogs,
          scheduledToday: existing.scheduledToday,
          completedToday: existing.completedToday,
          urgent: existing.urgent,
        },
        exerciseId,
      );

      plans[planId] = replaceExerciseInPlan(plan, exerciseId, nextExercise);
      return;
    }
  }

  async markExerciseCompletion(
    exerciseId: string,
    date: string,
    completed: boolean,
  ): Promise<void> {
    const dateOnly = date.slice(0, 10);
    const today = todayDateIso();

    for (const [planId, plan] of Object.entries(plans)) {
      const current = plan.exercises.find((exercise) => exercise.id === exerciseId);
      if (!current) continue;

      const completions = completed
        ? current.completions.includes(dateOnly)
          ? current.completions
          : [...current.completions, dateOnly]
        : current.completions.filter((entry) => entry !== dateOnly);

      const nextExercise = new Exercise(
        {
          name: current.name,
          detail: current.detail,
          icon: current.icon,
          current: current.current,
          target: current.target,
          completed: current.completed,
          metricType: current.metricType,
          targetDurationMinutes: current.targetDurationMinutes,
          notes: current.notes,
          sets: current.sets,
          reps: current.reps,
          image: current.image,
          daysOfWeek: current.daysOfWeek,
          completions,
          logs: current.logs,
          scheduledToday: current.scheduledToday,
          completedToday: completions.includes(today),
          urgent: current.urgent,
        },
        exerciseId,
      );

      const withExercise = replaceExerciseInPlan(plan, exerciseId, nextExercise);
      plans[planId] = syncPlanTodayStats(withExercise);
      return;
    }
  }

  async createPlan(input: {
    bodyPart: string;
    injuryType: string;
    surgeryDate: string;
  }): Promise<string> {
    void input;
    return "acl-recovery";
  }

  async updatePlanStatus(
    _planId: string,
    _status: RecoveryPlanStatus,
  ): Promise<void> {}

  async deletePlan(_planId: string): Promise<void> {}

  async addExercise(planId: string, input: AddExerciseInput): Promise<void> {
    const plan = plans[planId];
    if (!plan) throw new Error(`Plan no encontrado: ${planId}`);

    const isDuration = input.metricType === "DURATION";
    const target = isDuration
      ? input.targetDurationMinutes ?? 0
      : input.targetSets * input.targetReps;
    const detail = isDuration
      ? `${input.targetDurationMinutes ?? 0} min`
      : `${input.targetSets} series × ${input.targetReps} repeticiones`;
    const exercise = new Exercise(
      {
        name: input.name,
        detail,
        icon: "fitness_center",
        current: 0,
        target,
        completed: false,
        metricType: input.metricType,
        targetDurationMinutes: input.targetDurationMinutes ?? null,
        notes: input.notes ?? null,
        sets: input.targetSets,
        reps: input.targetReps,
        image: MOCK_EXERCISE_IMAGE,
        daysOfWeek: input.daysOfWeek ?? [],
        completions: [],
        logs: [],
        scheduledToday: true,
        completedToday: false,
        urgent: false,
      },
      `exercise-${Date.now()}`,
    );

    plan.exercises.push(exercise);
  }

  async deleteExercise(planId: string, exerciseId: string): Promise<void> {
    const plan = plans[planId];
    if (!plan) throw new Error(`Plan no encontrado: ${planId}`);
    const idx = plan.exercises.findIndex((ex) => ex.id === exerciseId);
    if (idx >= 0) plan.exercises.splice(idx, 1);
  }

  async updateExercise(
    planId: string,
    exerciseId: string,
    input: AddExerciseInput,
  ): Promise<void> {
    const plan = plans[planId];
    if (!plan) throw new Error(`Plan no encontrado: ${planId}`);
    const idx = plan.exercises.findIndex((ex) => ex.id === exerciseId);
    if (idx < 0) throw new Error(`Ejercicio no encontrado: ${exerciseId}`);

    const isDuration = input.metricType === "DURATION";
    const target = isDuration
      ? input.targetDurationMinutes ?? 0
      : input.targetSets * input.targetReps;
    const detail = isDuration
      ? `${input.targetDurationMinutes ?? 0} min`
      : `${input.targetSets} series × ${input.targetReps} repeticiones`;
    const current = plan.exercises[idx];
    plan.exercises[idx] = new Exercise(
      {
        name: input.name,
        detail,
        icon: current.icon,
        current: Math.min(current.current, target),
        target,
        completed: current.current >= target && target > 0,
        metricType: input.metricType,
        targetDurationMinutes: input.targetDurationMinutes ?? null,
        notes: input.notes ?? null,
        sets: input.targetSets,
        reps: input.targetReps,
        image: current.image,
        daysOfWeek: input.daysOfWeek ?? [],
        completions: current.completions,
        logs: current.logs,
        scheduledToday: current.scheduledToday,
        completedToday: current.completedToday,
        urgent: current.urgent,
      },
      exerciseId,
    );
  }

  async addAppointment(
    planId: string,
    input: AddAppointmentInput,
  ): Promise<void> {
    const plan = plans[planId];
    if (!plan) throw new Error(`Plan no encontrado: ${planId}`);

    const date = new Date(input.date);
    plan.appointments.push(
      new Appointment(
        {
          month: date.toLocaleString("es-AR", { month: "short" }),
          day: String(date.getDate()),
          title: input.title ?? input.provider,
          detail: input.notes ?? (input.type === "THERAPY" ? "Sesión de terapia" : "Cita médica"),
          provider: input.provider,
          notes: input.notes ?? null,
          type: input.type,
          date: date.toISOString(),
          attended: null,
          rescheduledFrom: null,
        },
        `appointment-${Date.now()}`,
      ),
    );
  }

  async updateAppointment(
    appointmentId: string,
    input: AddAppointmentInput,
  ): Promise<void> {
    for (const plan of Object.values(plans)) {
      const idx = plan.appointments.findIndex((a) => a.id === appointmentId);
      if (idx < 0) continue;
      const current = plan.appointments[idx];
      const date = new Date(input.date);
      const dateChanged = date.getTime() !== new Date(current.date).getTime();
      plan.appointments[idx] = new Appointment(
        {
          month: date.toLocaleString("es-AR", { month: "short" }),
          day: String(date.getDate()),
          title: input.title ?? input.provider,
          detail:
            input.notes ??
            (input.type === "THERAPY" ? "Sesión de terapia" : "Cita médica"),
          provider: input.provider,
          notes: input.notes ?? null,
          type: input.type,
          date: date.toISOString(),
          attended: dateChanged ? null : current.attended,
          rescheduledFrom: dateChanged ? current.date : current.rescheduledFrom,
        },
        current.id,
      );
      return;
    }
  }

  async markAppointmentAttendance(
    appointmentId: string,
    attended: boolean,
  ): Promise<void> {
    for (const plan of Object.values(plans)) {
      const idx = plan.appointments.findIndex((a) => a.id === appointmentId);
      if (idx < 0) continue;
      const current = plan.appointments[idx];
      plan.appointments[idx] = new Appointment(
        {
          month: current.month,
          day: current.day,
          title: current.title,
          detail: current.detail,
          provider: current.provider,
          notes: current.notes,
          type: current.type,
          date: current.date,
          attended,
          rescheduledFrom: current.rescheduledFrom,
        },
        current.id,
      );
      return;
    }
  }

  async deleteAppointment(planId: string, appointmentId: string): Promise<void> {
    const plan = plans[planId];
    if (!plan) throw new Error(`Plan no encontrado: ${planId}`);
    const idx = plan.appointments.findIndex((a) => a.id === appointmentId);
    if (idx >= 0) plan.appointments.splice(idx, 1);
  }

  async addPainLog(_planId: string, _input: AddPainLogInput): Promise<void> {}

  async addMeasurement(
    planId: string,
    input: AddMeasurementInput,
  ): Promise<void> {
    const plan = plans[planId];
    if (!plan) throw new Error(`Plan no encontrado: ${planId}`);
    if (input.type === "EXTENSION_DEGREES") {
      plan.metrics.kneeExtensionNote = `${input.value}${input.unit}`;
    }
    plans[planId] = clonePlan(plan, {
      measurements: [
        ...plan.measurements,
        { measurementId: crypto.randomUUID(), ...input },
      ],
    });
  }

  async updateMeasurement(
    measurementId: string,
    input: UpdateMeasurementInput,
  ): Promise<void> {
    for (const [planId, plan] of Object.entries(plans)) {
      const idx = plan.measurements.findIndex(
        (m) => m.measurementId === measurementId,
      );
      if (idx < 0) continue;
      const measurements = [...plan.measurements];
      measurements[idx] = { measurementId, ...input };
      plans[planId] = clonePlan(plan, { measurements });
      if (input.type === "EXTENSION_DEGREES") {
        plan.metrics.kneeExtensionNote = `${input.value}${input.unit}`;
      }
      return;
    }
    throw new Error(`Medición no encontrada: ${measurementId}`);
  }

  async deleteMeasurement(measurementId: string): Promise<void> {
    for (const [planId, plan] of Object.entries(plans)) {
      const idx = plan.measurements.findIndex(
        (m) => m.measurementId === measurementId,
      );
      if (idx < 0) continue;
      const measurements = plan.measurements.filter(
        (m) => m.measurementId !== measurementId,
      );
      plans[planId] = clonePlan(plan, { measurements });
      return;
    }
    throw new Error(`Medición no encontrada: ${measurementId}`);
  }

  async setAdHocProtocolDay(
    planId: string,
    targetDate: string,
    sourceDate: string,
  ): Promise<void> {
    const plan = plans[planId];
    if (!plan) throw new Error(`Plan no encontrado: ${planId}`);
    plans[planId] = clonePlan(plan, {
      adHocProtocolDays: {
        ...plan.adHocProtocolDays,
        [targetDate]: sourceDate,
      },
    });
  }

  async clearAdHocProtocolDay(
    planId: string,
    targetDate: string,
  ): Promise<void> {
    const plan = plans[planId];
    if (!plan) throw new Error(`Plan no encontrado: ${planId}`);
    const next = { ...plan.adHocProtocolDays };
    delete next[targetDate];
    plans[planId] = clonePlan(plan, { adHocProtocolDays: next });
  }
}
