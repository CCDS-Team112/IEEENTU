"use client";

import {
  clampFontScaleIndex,
  defaultPreferences,
  type AccessibilityPreferences,
  type ContrastMode,
} from "@/features/accessibility/domain/preferences";

const STORAGE_KEY = "accessibility-preferences";

export function loadPreferences(): AccessibilityPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Partial<AccessibilityPreferences>;
    const contrast: ContrastMode = parsed.contrast === "high" ? "high" : "default";
    const fontScaleIndex = clampFontScaleIndex(Number(parsed.fontScaleIndex ?? 0));
    return { contrast, fontScaleIndex };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: AccessibilityPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

