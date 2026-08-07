export function planExerciseHref(planId: string, exerciseId: string): string {
  return `/rehab/plans/${planId}?exercise=${encodeURIComponent(exerciseId)}`;
}

export function exerciseDomId(exerciseId: string): string {
  return `exercise-${exerciseId}`;
}
