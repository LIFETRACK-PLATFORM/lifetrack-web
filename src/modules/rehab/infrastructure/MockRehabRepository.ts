import { DashboardSummary } from "../domain/DashboardSummary";
import { RehabPlan } from "../domain/RehabPlan";
import { Exercise } from "../domain/Exercise";
import { Appointment } from "../domain/Appointment";
import { RehabRepository } from "../domain/RehabRepository";

const dashboard = new DashboardSummary(
  {
    planId: "acl-recovery",
    focusTitle: "Lower Back Resilience",
    exerciseProgress: { done: 4, total: 6, percent: 66 },
    nextAppointment: {
      title: "Next Medical Check-up",
      detail: "Physical Therapy • Tomorrow, 09:30 AM",
    },
    weeklyCompliance: 92,
    weeklyBars: [80, 95, 70, 100, 90, 30, 20],
    recoveryScore: 84,
    activeMinutes: 42,
    activeMinutesDelta: "+12% vs last wk",
    phase: {
      name: "Phase 2: Strength",
      percent: 75,
      description:
        "Focusing on eccentric loading and neuromuscular control. You have 12 days left in this phase before evaluation.",
    },
    todayExercises: [
      {
        id: "ex-1",
        name: "Resistance Band Rotations",
        detail: "3 Sets × 15 Reps",
        status: "completed",
      },
      {
        id: "ex-2",
        name: "Weighted Step-ups",
        detail: "4 Sets × 10 Reps",
        status: "pending",
      },
      {
        id: "ex-3",
        name: "Static Wall Sit",
        detail: "2 Sets × 45 Seconds",
        status: "urgent",
      },
    ],
    upNext: [
      {
        id: "next-1",
        name: "Bird-Dog Extension",
        detail: "3 sets • 12 reps",
        icon: "accessibility_new",
        locked: false,
      },
      {
        id: "next-2",
        name: "Pelvic Tilts",
        detail: "2 sets • 15 reps",
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
      titleMobile: "Post-Op ACL Recovery",
      titleWeb: "Knee ACL Recovery",
      phaseLabel: "Phase II: Loading",
      dayProgress: "Day 14/30",
      weekLabel: "Week 6 of 12 • Phase 2: Mobility & Strengthening",
      statusMessage: "Progressing according to plan",
      remainingToday: 3,
      exercises: [
        new Exercise(
          {
            name: "Quad Sets (Isometric)",
            detail: "Hold 10s • 10 Reps",
            icon: "fitness_center",
            current: 8,
            target: 10,
            completed: false,
            category: "Strength",
            sets: 3,
            reps: 15,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAarTEW0pmSQ0_-4zhv_22QG9m6MOOC6WcChAeiI16MYrP3ik7bdP4jTINGvuwDfto9EGtK5pNRTcXMx4uamyzd_jntN4QBThkX6ASZiStIA2odrcuorwqhSR-6qWVixw93GKunSm6sSkyXNhoukmzfpFw7G7rKMpK2hoYjP21oV6sBhe9ZPKcdpHFt7aCfVutXWdnH9WmCdtC5-LHmYYnKIB7w0TnAaVRvCZKFfvnm_vFzaWK8feHQpA",
          },
          "quad-sets",
        ),
        new Exercise(
          {
            name: "Ankle Pumps",
            detail: "Continuous • 20 Reps",
            icon: "directions_walk",
            current: 15,
            target: 20,
            completed: false,
            category: "Mobility",
            sets: 2,
            reps: 10,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCcdc34GK0rS-iIDGl2eMNYg8sVM7MH642Um9DnnNxtwcA1Xl2ftt0TOFbgFzwcz2i_KUFpWoOtvBHp7417YSPzX1U1Y6TJhKWEwsF1p9UFLiSKmMeAoYvJ6SOjiTWNrwyOnJRIjA6pETUQafUtGOQxDW19tTSDALmGkpFI5-lnNRzs6o27wnxrjnZIvIPe_Eh29HC_8bscTAsNTKexwEMr9zFv89ghwKp41a320aLBBne1cB7wBQgtqg",
          },
          "ankle-pumps",
        ),
        new Exercise(
          {
            name: "Straight Leg Raises",
            detail: "10 Reps • 3 Sets",
            icon: "check_circle",
            current: 10,
            target: 10,
            completed: true,
            category: "Core/Stability",
            sets: 3,
            reps: 12,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAf_46SdyqTYUqWaQ4aLdBI5aEVEng_vX6_gEA2uzS9xfjd4io5jHwukBeg8j7RR3mr2SsgkpWSZig6fuV3KBNZ_NOH94yw5WNEdDD259FrYxosJ5sVMBrZ1DLxO5emmh2Ccm62sKTIUYpZrv62OnDNILY5sKQVRBr8IOXrx40vZqDx_6mJuIh6YaKZXiNCMp5iE4rI7HK_GPP5HndU5OX7k9O6wKPGKu2v27sUwOnA68gwl33pV0QMmA",
          },
          "slr",
        ),
        new Exercise(
          {
            name: "Glute Squeezes",
            detail: "Hold 5s • 15 Reps",
            icon: "fitness_center",
            current: 0,
            target: 15,
            completed: false,
            category: "Isometric",
            sets: 3,
            reps: 15,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDJvQGkHp77hRxtTHqHh8-h6xhBvygNBJVsXqpktw9kgaPZh8w_okgrfIGa96irO9etdnKGXMkLqm8ldKp_JMR-sKlxJ7S-xn8LhgvYEHAxgVMlW1XV3Uo4Uve44vwtIrBE9v8aSHcqTpgj5mzSmry2r7QX0QNlbibR9_CZWBPR5O590WpOLdrhOTwhMXAcVVt4FKC5OYjaNxGlbrHi_zFz3oA8v_UbeHU8e5uNvnqc8QO6fMBA_Xd_Ig",
          },
          "glute",
        ),
      ],
      appointments: [
        new Appointment(
          {
            month: "OCT",
            day: "24",
            title: "Physiotherapy Evaluation",
            detail: "09:00 AM • Apex Medical Center",
          },
          "apt-1",
        ),
      ],
      metrics: {
        kneeExtensionNote: "+2° improvement",
        painLevel: "3/10",
      },
    },
    "acl-recovery",
  ),
};

export class MockRehabRepository implements RehabRepository {
  async getDashboard(): Promise<DashboardSummary> {
    return dashboard;
  }

  async getPlan(id: string): Promise<RehabPlan> {
    const plan = plans[id];
    if (!plan) throw new Error(`Plan not found: ${id}`);
    return plan;
  }

  async updateExerciseProgress(
    _planId: string,
    _exerciseId: string,
    _current: number,
  ): Promise<void> {}

  async createPlan(input: {
    bodyPart: string;
    injuryType: string;
    surgeryDate: string;
  }): Promise<string> {
    void input;
    return "acl-recovery";
  }
}
