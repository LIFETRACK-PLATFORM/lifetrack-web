import { DashboardSummary } from "../domain/DashboardSummary";
import { RehabPlan } from "../domain/RehabPlan";
import { Exercise } from "../domain/Exercise";
import { Appointment } from "../domain/Appointment";
import {
  AddAppointmentInput,
  AddExerciseInput,
  AddPainLogInput,
  RehabRepository,
} from "../domain/RehabRepository";

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
      remainingToday: 3,
      weeklyCompliancePercent: 92,
      streakDays: 5,
      completedTodayCount: 1,
      scheduledTodayCount: 4,
      exercises: [
        new Exercise(
          {
            name: "Contracciones de cuádriceps (isométrico)",
            detail: "Mantener 10 s • 10 repeticiones",
            icon: "fitness_center",
            current: 8,
            target: 10,
            completed: false,
            category: "Fuerza",
            sets: 3,
            reps: 15,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAarTEW0pmSQ0_-4zhv_22QG9m6MOOC6WcChAeiI16MYrP3ik7bdP4jTINGvuwDfto9EGtK5pNRTcXMx4uamyzd_jntN4QBThkX6ASZiStIA2odrcuorwqhSR-6qWVixw93GKunSm6sSkyXNhoukmzfpFw7G7rKMpK2hoYjP21oV6sBhe9ZPKcdpHFt7aCfVutXWdnH9WmCdtC5-LHmYYnKIB7w0TnAaVRvCZKFfvnm_vFzaWK8feHQpA",
            daysOfWeek: [],
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
            category: "Movilidad",
            sets: 2,
            reps: 10,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCcdc34GK0rS-iIDGl2eMNYg8sVM7MH642Um9DnnNxtwcA1Xl2ftt0TOFbgFzwcz2i_KUFpWoOtvBHp7417YSPzX1U1Y6TJhKWEwsF1p9UFLiSKmMeAoYvJ6SOjiTWNrwyOnJRIjA6pETUQafUtGOQxDW19tTSDALmGkpFI5-lnNRzs6o27wnxrjnZIvIPe_Eh29HC_8bscTAsNTKexwEMr9zFv89ghwKp41a320aLBBne1cB7wBQgtqg",
            daysOfWeek: [1, 3, 5],
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
            category: "Núcleo/Estabilidad",
            sets: 3,
            reps: 12,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAf_46SdyqTYUqWaQ4aLdBI5aEVEng_vX6_gEA2uzS9xfjd4io5jHwukBeg8j7RR3mr2SsgkpWSZig6fuV3KBNZ_NOH94yw5WNEdDD259FrYxosJ5sVMBrZ1DLxO5emmh2Ccm62sKTIUYpZrv62OnDNILY5sKQVRBr8IOXrx40vZqDx_6mJuIh6YaKZXiNCMp5iE4rI7HK_GPP5HndU5OX7k9O6wKPGKu2v27sUwOnA68gwl33pV0QMmA",
            daysOfWeek: [],
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
            category: "Isométrico",
            sets: 3,
            reps: 15,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDJvQGkHp77hRxtTHqHh8-h6xhBvygNBJVsXqpktw9kgaPZh8w_okgrfIGa96irO9etdnKGXMkLqm8ldKp_JMR-sKlxJ7S-xn8LhgvYEHAxgVMlW1XV3Uo4Uve44vwtIrBE9v8aSHcqTpgj5mzSmry2r7QX0QNlbibR9_CZWBPR5O590WpOLdrhOTwhMXAcVVt4FKC5OYjaNxGlbrHi_zFz3oA8v_UbeHU8e5uNvnqc8QO6fMBA_Xd_Ig",
            daysOfWeek: [2, 4],
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
            type: "THERAPY",
          },
          "apt-1",
        ),
      ],
      metrics: {
        kneeExtensionNote: "+2° de mejora",
        painLevel: "3/10",
      },
    },
    "acl-recovery",
  ),
};

export class MockRehabRepository implements RehabRepository {
  async getDashboard(): Promise<DashboardSummary[]> {
    return [dashboard];
  }

  async getPlan(id: string): Promise<RehabPlan> {
    const plan = plans[id];
    if (!plan) throw new Error(`Plan no encontrado: ${id}`);
    return plan;
  }

  async updateExerciseProgress(
    _planId: string,
    _exerciseId: string,
    _current: number,
  ): Promise<void> {}

  async markExerciseCompletion(
    _exerciseId: string,
    _date: string,
    _completed: boolean,
  ): Promise<void> {}

  async createPlan(input: {
    bodyPart: string;
    injuryType: string;
    surgeryDate: string;
  }): Promise<string> {
    void input;
    return "acl-recovery";
  }

  async addExercise(planId: string, input: AddExerciseInput): Promise<void> {
    const plan = plans[planId];
    if (!plan) throw new Error(`Plan no encontrado: ${planId}`);

    const target = input.targetSets * input.targetReps;
    const exercise = new Exercise(
      {
        name: input.name,
        detail: `${input.targetSets} series × ${input.targetReps} repeticiones`,
        icon: "fitness_center",
        current: 0,
        target,
        completed: false,
        category: `phase-${input.phase}`,
        sets: input.targetSets,
        reps: input.targetReps,
        image: MOCK_EXERCISE_IMAGE,
        daysOfWeek: input.daysOfWeek ?? [],
        scheduledToday: true,
        completedToday: false,
        urgent: false,
      },
      `exercise-${Date.now()}`,
    );

    plan.exercises.push(exercise);
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
          title: input.provider,
          detail: input.notes ?? (input.type === "THERAPY" ? "Sesión de terapia" : "Cita médica"),
          type: input.type,
        },
        `appointment-${Date.now()}`,
      ),
    );
  }

  async addPainLog(_planId: string, _input: AddPainLogInput): Promise<void> {}
}
