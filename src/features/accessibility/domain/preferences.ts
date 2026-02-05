import { FONT_SCALE_OPTIONS } from "@/shared/lib/constants";

export type ContrastMode = "default" | "high";

export type AccessibilityPreferences = {
  contrast: ContrastMode;
  fontScaleIndex: number;
};

export const defaultPreferences: AccessibilityPreferences = {
  contrast: "default",
  fontScaleIndex: 0,
};

export function clampFontScaleIndex(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(FONT_SCALE_OPTIONS.length - 1, value));
}

