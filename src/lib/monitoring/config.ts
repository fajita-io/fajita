import "server-only";

import { z } from "zod";

import {
  ASSERTION_TYPES,
  CHECK_INTERVALS_SECONDS,
  EXPECTED_VALUE_TYPES,
  HTTP_METHODS,
  MONITOR_TYPES,
  type MonitorConfigSnapshot,
} from "@contracts/contract";

/**
 * Typed validation for monitor configuration. Every constraint here mirrors the
 * database check constraints and the shared contracts so the app rejects invalid
 * input before it reaches the database, with plain-language messages.
 */

export const assertionInputSchema = z.object({
  assertion_type: z.enum(ASSERTION_TYPES),
  field_path: z.string().max(512).nullable().optional(),
  operator: z.string().max(64).nullable().optional(),
  expected_value: z.string().max(1024).nullable().optional(),
  expected_value_type: z.enum(EXPECTED_VALUE_TYPES).default("string"),
  case_sensitive: z.boolean().default(false),
  position: z.number().int().min(0).max(100).default(0),
});

export type AssertionInput = z.infer<typeof assertionInputSchema>;

const httpsUrl = z
  .string()
  .trim()
  .min(1, "A target URL is required.")
  .max(2048, "The URL is too long.");

export const monitorConfigSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(160),
    description: z.string().trim().max(2000).optional().default(""),
    monitor_type: z.enum(MONITOR_TYPES),
    target_url: httpsUrl.nullable().optional(),
    http_method: z.enum(HTTP_METHODS).default("GET"),
    check_interval_seconds: z
      .number()
      .int()
      .refine(
        (v) => (CHECK_INTERVALS_SECONDS as readonly number[]).includes(v),
        "Choose an approved check interval.",
      )
      .default(300),
    timeout_ms: z.number().int().min(1000).max(60000).default(10000),
    retry_count: z.number().int().min(0).max(5).default(1),
    retry_delay_ms: z.number().int().min(0).max(60000).default(3000),
    follow_redirects: z.boolean().default(true),
    max_redirects: z.number().int().min(0).max(10).default(5),
    expected_status_codes: z
      .array(z.number().int().min(100).max(599))
      .max(20)
      .default([200]),
    response_time_threshold_ms: z.number().int().positive().nullable().optional(),
    body_size_limit_bytes: z
      .number()
      .int()
      .min(1024)
      .max(10485760)
      .default(1048576),
    assertions: z.array(assertionInputSchema).max(50).default([]),
  })
  .superRefine((cfg, ctx) => {
    // Non-heartbeat monitors require a target URL.
    if (cfg.monitor_type !== "heartbeat" && !cfg.target_url) {
      ctx.addIssue({
        code: "custom",
        path: ["target_url"],
        message: "A target URL is required for this monitor type.",
      });
    }
    // Heartbeat monitors execute no outbound request.
    if (cfg.monitor_type === "heartbeat" && cfg.target_url) {
      ctx.addIssue({
        code: "custom",
        path: ["target_url"],
        message: "Heartbeat monitors do not use a target URL.",
      });
    }
  });

export type MonitorConfigInput = z.input<typeof monitorConfigSchema>;
export type MonitorConfig = z.infer<typeof monitorConfigSchema>;

/**
 * Build the version-faithful configuration snapshot the worker executes from.
 * Secrets are referenced by id, never inlined.
 */
export function buildConfigSnapshot(
  cfg: MonitorConfig,
  secretIds: string[],
): MonitorConfigSnapshot {
  return {
    monitor_type: cfg.monitor_type,
    target_url: cfg.target_url ?? null,
    http_method: cfg.http_method,
    check_interval_seconds: cfg.check_interval_seconds,
    timeout_ms: cfg.timeout_ms,
    retry_count: cfg.retry_count,
    retry_delay_ms: cfg.retry_delay_ms,
    follow_redirects: cfg.follow_redirects,
    max_redirects: cfg.max_redirects,
    expected_status_codes: cfg.expected_status_codes,
    response_time_threshold_ms: cfg.response_time_threshold_ms ?? null,
    body_size_limit_bytes: cfg.body_size_limit_bytes,
    assertions: cfg.assertions.map((a, i) => ({
      id: null,
      assertion_type: a.assertion_type,
      field_path: a.field_path ?? null,
      operator: a.operator ?? null,
      expected_value: a.expected_value ?? null,
      expected_value_type: a.expected_value_type,
      case_sensitive: a.case_sensitive,
      position: a.position ?? i,
    })),
    secret_ids: secretIds,
  };
}
