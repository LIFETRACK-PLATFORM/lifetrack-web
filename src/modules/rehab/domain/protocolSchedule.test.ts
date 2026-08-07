import { describe, expect, it } from "vitest";
import {
  formatDateIsoCalendar,
  getExercisesDueOn,
  getProtocolStatsForDate,
  isCompletedOnDate,
  isExerciseDueOnDate,
  isFutureDate,
} from "./protocolSchedule";

const exercises = [
  { daysOfWeek: [] as number[], completions: ["2026-08-05"] },
  { daysOfWeek: [1, 3, 5], completions: [] as string[] },
  { daysOfWeek: [2, 4], completions: ["2026-08-04"] },
];

describe("protocolSchedule", () => {
  it("considera todos los días cuando daysOfWeek está vacío", () => {
    expect(isExerciseDueOnDate(exercises[0], "2026-08-07")).toBe(true);
  });

  it("filtra ejercicios por día de la semana", () => {
    expect(getExercisesDueOn(exercises, "2026-08-07")).toHaveLength(2);
    expect(getExercisesDueOn(exercises, "2026-08-04")).toHaveLength(2);
  });

  it("detecta cumplimiento en una fecha", () => {
    expect(isCompletedOnDate(exercises[0], "2026-08-05")).toBe(true);
    expect(isCompletedOnDate(exercises[0], "2026-08-06")).toBe(false);
  });

  it("calcula stats due/completed para una fecha", () => {
    const stats = getProtocolStatsForDate(exercises, "2026-08-05");
    expect(stats).toEqual({
      due: 2,
      completed: 1,
      remaining: 1,
      percent: 50,
    });
  });

  it("devuelve stats vacías cuando ningún ejercicio corresponde ese día", () => {
    const onlyTueThu = [{ daysOfWeek: [2, 4], completions: [] as string[] }];
    const stats = getProtocolStatsForDate(onlyTueThu, "2026-08-03");
    expect(stats).toEqual({
      due: 0,
      completed: 0,
      remaining: 0,
      percent: 0,
    });
  });

  it("identifica fechas futuras", () => {
    expect(isFutureDate("2026-08-08", "2026-08-07")).toBe(true);
    expect(isFutureDate("2026-08-07", "2026-08-07")).toBe(false);
  });

  it("formatea titulo sin corrimiento de zona horaria", () => {
    expect(
      formatDateIsoCalendar("2026-08-05", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    ).toMatch(/mi[eé]rcoles.*5.*agosto/i);
  });
});
