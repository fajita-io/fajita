"use client";

import { useCallback, useEffect, useState } from "react";

import {
  THEME_STORAGE_KEY,
  resolveTheme,
  type ThemePreference,
} from "./theme-script";

function readPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

/**
 * Theme state with persistence. The applied theme lives on
 * <html data-theme>; preference persists to localStorage. "system"
 * follows the OS and updates live when the OS preference changes.
 */
export function useTheme() {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(readPreference);

  const apply = useCallback((pref: ThemePreference) => {
    const systemDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = resolveTheme(pref, systemDark);
  }, []);

  const setPreference = useCallback(
    (pref: ThemePreference) => {
      setPreferenceState(pref);
      if (pref === "system") {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        window.localStorage.setItem(THEME_STORAGE_KEY, pref);
      }
      apply(pref);
    },
    [apply],
  );

  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference, apply]);

  return { preference, setPreference };
}
