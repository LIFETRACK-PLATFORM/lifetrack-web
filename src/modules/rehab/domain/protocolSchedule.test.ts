import { describe, expect, it } from "vitest";
import {
  addDaysToIso,
  formatDateIsoCalendar,
  formatWeekRangeLabel,
  getExercisesDueOn,
  getExercisesForProtocolView,
  getExercisesRecordedOn,
  getProtocolStatsForDate,
  isCompletedOnDate,
  isExerciseDueOnDate,
  isFutureDate,
  isSameWeek,
  pickViewingDateForWeek,
  shiftWeekIso,
  startOfWeekIso,
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

  it("muestra ejercicios registrados en un dia sin agenda", () => {
    const withCompletion = [
      { daysOfWeek: [2, 4], completions: ["2026-08-07"] as string[] },
    ];
    expect(getExercisesRecordedOn(withCompletion, "2026-08-07")).toHaveLength(1);
    expect(
      getExercisesForProtocolView(withCompletion, "2026-08-07", null),
    ).toHaveLength(1);
  });

  it("prioriza agenda, luego rutina prestada y luego registrados", () => {
    const items = [
      { daysOfWeek: [5], completions: [] as string[] },
      { daysOfWeek: [3], completions: [] as string[] },
    ];
    expect(getExercisesForProtocolView(items, "2026-08-07", null)).toHaveLength(1);
    expect(getExercisesForProtocolView(items, "2026-08-06", "2026-08-05")).toHaveLength(
      1,
    );
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

  it("calcula inicio de semana en domingo", () => {
    expect(startOfWeekIso("2026-08-09")).toBe("2026-08-09");
    expect(startOfWeekIso("2026-08-05")).toBe("2026-08-02");
  });

  it("desplaza semanas y detecta semana actual", () => {
    expect(shiftWeekIso("2026-08-09", -1)).toBe("2026-08-02");
    expect(addDaysToIso("2026-08-09", -7)).toBe("2026-08-02");
    expect(isSameWeek("2026-08-05", "2026-08-07")).toBe(true);
    expect(isSameWeek("2026-08-09", "2026-08-05")).toBe(false);
  });

  it("formatea rango semanal", () => {
    expect(formatWeekRangeLabel("2026-08-03", "2026-08-09")).toMatch(
      /3.*ago.*9.*ago.*2026/i,
    );
  });

  it("elige fecha visible al cambiar semana", () => {
    const weekDays = [
      { date: "2026-07-27" },
      { date: "2026-07-28" },
      { date: "2026-07-29" },
      { date: "2026-07-30" },
      { date: "2026-07-31" },
      { date: "2026-08-01" },
      { date: "2026-08-02" },
    ];

    expect(
      pickViewingDateForWeek(weekDays, "2026-08-06", "2026-08-09"),
    ).toBe("2026-07-30");
    expect(
      pickViewingDateForWeek(
        [
          { date: "2026-08-09" },
          { date: "2026-08-10" },
          { date: "2026-08-11" },
          { date: "2026-08-12" },
          { date: "2026-08-13" },
          { date: "2026-08-14" },
          { date: "2026-08-15" },
        ],
        "2026-07-30",
        "2026-08-09",
      ),
    ).toBe("2026-08-09");
  });
});
