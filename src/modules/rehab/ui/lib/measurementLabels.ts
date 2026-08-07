import type { MeasurementType } from "@/modules/rehab/domain/RehabRepository";

export const MEASUREMENT_TYPES: MeasurementType[] = [
  "WEIGHT_KG",
  "WAIST_CM",
  "HIP_CM",
  "NECK_CM",
  "FLEXION_DEGREES",
  "EXTENSION_DEGREES",
  "QUAD_CIRCUMFERENCE_CM",
  "OTHER",
];

export const MEASUREMENT_TYPE_LABELS: Record<MeasurementType, string> = {
  WEIGHT_KG: "Peso",
  WAIST_CM: "Circunferencia de cintura",
  HIP_CM: "Circunferencia de cadera",
  NECK_CM: "Circunferencia de cuello",
  FLEXION_DEGREES: "Flexión de rodilla",
  EXTENSION_DEGREES: "Extensión de rodilla",
  QUAD_CIRCUMFERENCE_CM: "Circunferencia de cuádriceps",
  OTHER: "Otro",
};

export const MEASUREMENT_TYPE_UNITS: Record<MeasurementType, string> = {
  WEIGHT_KG: "kg",
  WAIST_CM: "cm",
  HIP_CM: "cm",
  NECK_CM: "cm",
  FLEXION_DEGREES: "°",
  EXTENSION_DEGREES: "°",
  QUAD_CIRCUMFERENCE_CM: "cm",
  OTHER: "",
};

/** Label a mostrar: el nombre libre si el tipo es OTHER, si no el label fijo. */
export function measurementDisplayLabel(point: {
  type: MeasurementType;
  customLabel?: string;
}): string {
  if (point.type === "OTHER" && point.customLabel?.trim()) {
    return point.customLabel;
  }
  return MEASUREMENT_TYPE_LABELS[point.type];
}
