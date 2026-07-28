"use client";

import { useEffect, useMemo, useState } from "react";

function supportedTimezones(): string[] {
  try {
    const withValues = Intl as unknown as {
      supportedValuesOf?: (key: string) => string[];
    };
    if (typeof withValues.supportedValuesOf === "function") {
      return withValues.supportedValuesOf("timeZone");
    }
  } catch {
    /* fall through */
  }
  return [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Berlin",
    "Europe/Madrid",
    "Africa/Johannesburg",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];
}

/** Detect the browser timezone, safe on the server (returns UTC). */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function TimezoneSelect({
  id,
  name,
  value,
  onChange,
  disabled,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const zones = useMemo(() => {
    if (!mounted) return [value];
    const list = supportedTimezones();
    return list.includes(value) ? list : [value, ...list];
  }, [mounted, value]);

  return (
    <select
      id={id}
      name={name}
      className="fj-input"
      value={value}
      disabled={disabled}
      suppressHydrationWarning
      onChange={(e) => onChange(e.target.value)}
    >
      {zones.map((zone) => (
        <option key={zone} value={zone}>
          {zone.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}
