"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadPreferences,
  savePreferences,
} from "@/features/accessibility/application/preferencesStore";
import {
  defaultPreferences,
  type AccessibilityPreferences,
} from "@/features/accessibility/domain/preferences";
import { FONT_SCALE_OPTIONS } from "@/shared/lib/constants";
import { Button } from "@/shared/ui/Button";

function applyPreferences(preferences: AccessibilityPreferences) {
  const root = document.documentElement;
  root.dataset.contrast = preferences.contrast === "high" ? "true" : "false";
  root.style.setProperty(
    "--font-scale",
    String(FONT_SCALE_OPTIONS[preferences.fontScaleIndex] ?? 1),
  );
}

export function A11yToolbar() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() =>
    loadPreferences() ?? defaultPreferences,
  );

  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  const fontPercent = useMemo(() => {
    const scale = FONT_SCALE_OPTIONS[preferences.fontScaleIndex] ?? 1;
    return Math.round(scale * 100);
  }, [preferences.fontScaleIndex]);

  function update(next: AccessibilityPreferences) {
    setPreferences(next);
    savePreferences(next);
  }

  return (
    <section
      aria-label="Accessibility settings"
      className="flex flex-wrap items-center gap-2"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          update({
            ...preferences,
            contrast: preferences.contrast === "high" ? "default" : "high",
          })
        }
        aria-pressed={preferences.contrast === "high"}
      >
        Contrast: {preferences.contrast === "high" ? "High" : "Default"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          update({
            ...preferences,
            fontScaleIndex:
              (preferences.fontScaleIndex + 1) % FONT_SCALE_OPTIONS.length,
          })
        }
      >
        Text: {fontPercent}%
      </Button>
    </section>
  );
}
