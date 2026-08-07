import { describe, expect, it } from "vitest";
import { mapProgressToPlan } from "./RecoveryProgressMapper";
import type {
  GetTodayExercisesResponseDto,
  RecoveryProgressDto,
  WeeklySummaryDto,
} from "../dtos/RecoveryProgressDto";

function buildDto(
  overrides: Partial<RecoveryProgressDto> = {},
): RecoveryProgressDto {
  return {
    recoveryPlanId: "plan-1",
    bodyPart: "Cadera",
    injuryType: "Bajar de peso",
    surgeryDate: "2026-07-01T00:00:00.000Z",
    status: "ACTIVE",
    exercises: [],
    appointments: [],
    measurements: [],
    progressPhotos: [],
    painLogs: [],
    ...overrides,
  };
}

const today: GetTodayExercisesResponseDto = { exercises: [] };

const weeklySummary: WeeklySummaryDto = {
  recoveryPlanId: "plan-1",
  weekStart: "2026-08-03",
  weekEnd: "2026-08-09",
  days: [],
  weeklyCompliancePercent: 0,
  appointmentsByType: { therapy: 0, medical: 0 },
  streakDays: 0,
};

describe("mapProgressToPlan", () => {
  it("incluye mediciones de todos los tipos, no solo EXTENSION", () => {
    const dto = buildDto({
      measurements: [
        {
          measurementId: "m1",
          recoveryPlanId: "plan-1",
          type: "WEIGHT_KG",
          value: 80,
          unit: "kg",
          date: "2026-08-01T00:00:00.000Z",
        },
        {
          measurementId: "m2",
          recoveryPlanId: "plan-1",
          type: "WAIST_CM",
          value: 90,
          unit: "cm",
          date: "2026-08-02T00:00:00.000Z",
        },
        {
          measurementId: "m3",
          recoveryPlanId: "plan-1",
          type: "EXTENSION_DEGREES",
          value: 2,
          unit: "°",
          date: "2026-08-03T00:00:00.000Z",
        },
      ],
    });

    const plan = mapProgressToPlan(dto, today, weeklySummary);

    expect(plan.measurements).toHaveLength(3);
    expect(plan.measurements.map((m) => m.type)).toEqual([
      "WEIGHT_KG",
      "WAIST_CM",
      "EXTENSION_DEGREES",
    ]);
  });

  it("ordena measurements por fecha ascendente", () => {
    const dto = buildDto({
      measurements: [
        {
          measurementId: "m1",
          recoveryPlanId: "plan-1",
          type: "WEIGHT_KG",
          value: 79,
          unit: "kg",
          date: "2026-08-05T00:00:00.000Z",
        },
        {
          measurementId: "m2",
          recoveryPlanId: "plan-1",
          type: "WEIGHT_KG",
          value: 80,
          unit: "kg",
          date: "2026-08-01T00:00:00.000Z",
        },
      ],
    });

    const plan = mapProgressToPlan(dto, today, weeklySummary);

    expect(plan.measurements.map((m) => m.value)).toEqual([80, 79]);
  });

  it("sigue calculando kneeExtensionNote igual que antes, a partir de la última EXTENSION_DEGREES", () => {
    const dto = buildDto({
      measurements: [
        {
          measurementId: "m1",
          recoveryPlanId: "plan-1",
          type: "EXTENSION_DEGREES",
          value: 1,
          unit: "°",
          date: "2026-08-01T00:00:00.000Z",
        },
        {
          measurementId: "m2",
          recoveryPlanId: "plan-1",
          type: "WEIGHT_KG",
          value: 80,
          unit: "kg",
          date: "2026-08-02T00:00:00.000Z",
        },
        {
          measurementId: "m3",
          recoveryPlanId: "plan-1",
          type: "EXTENSION_DEGREES",
          value: 3,
          unit: "°",
          date: "2026-08-03T00:00:00.000Z",
        },
      ],
    });

    const plan = mapProgressToPlan(dto, today, weeklySummary);

    expect(plan.metrics.kneeExtensionNote).toBe("3°");
  });

  it("muestra 'Sin mediciones aún' si no hay EXTENSION_DEGREES, aunque haya otras mediciones", () => {
    const dto = buildDto({
      measurements: [
        {
          measurementId: "m1",
          recoveryPlanId: "plan-1",
          type: "WEIGHT_KG",
          value: 80,
          unit: "kg",
          date: "2026-08-01T00:00:00.000Z",
        },
      ],
    });

    const plan = mapProgressToPlan(dto, today, weeklySummary);

    expect(plan.metrics.kneeExtensionNote).toBe("Sin mediciones aún");
  });
});
