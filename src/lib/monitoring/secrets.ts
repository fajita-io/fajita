import "server-only";

import type { SecretType } from "@contracts/contract";

import { serviceClient } from "@/lib/supabase/service";
import { encryptSecret, maskSecret } from "@/lib/monitoring/secret-crypto";

/**
 * Monitor-secret data layer. Secrets are envelope-encrypted before storage and
 * never returned in full. Reads expose only masked labels. The table has no RLS
 * read policy, so even a direct authenticated PostgREST read returns nothing;
 * this layer runs through the service role after an explicit permission check.
 */

export interface SecretSummary {
  id: string;
  secretType: string;
  headerName: string | null;
  maskedLabel: string;
  createdAt: string;
  rotatedAt: string | null;
}

/** Encrypt and store a secret. Returns only the id and masked label. */
export async function addSecret(params: {
  organizationId: string;
  monitorId: string;
  actorProfileId: string;
  secretType: SecretType;
  headerName?: string | null;
  value: string;
}): Promise<{ id: string; maskedLabel: string }> {
  const db = serviceClient();
  const { envelope, keyVersion } = encryptSecret(params.value);
  const maskedLabel = maskSecret(params.value);

  const { data, error } = await db
    .from("monitor_secrets")
    .insert({
      organization_id: params.organizationId,
      monitor_id: params.monitorId,
      secret_type: params.secretType,
      header_name: params.headerName ?? null,
      encrypted_payload: envelope,
      encryption_key_version: keyVersion,
      masked_label: maskedLabel,
      created_by_user_id: params.actorProfileId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id, maskedLabel };
}

/** Rotate a secret in place: new ciphertext, new masked label, rotated_at set. */
export async function rotateSecret(params: {
  organizationId: string;
  secretId: string;
  value: string;
}): Promise<{ maskedLabel: string }> {
  const db = serviceClient();
  const { envelope, keyVersion } = encryptSecret(params.value);
  const maskedLabel = maskSecret(params.value);

  const { error } = await db
    .from("monitor_secrets")
    .update({
      encrypted_payload: envelope,
      encryption_key_version: keyVersion,
      masked_label: maskedLabel,
      rotated_at: new Date().toISOString(),
    })
    .eq("id", params.secretId)
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null);
  if (error) throw error;
  return { maskedLabel };
}

/** Soft-delete a secret. */
export async function deleteSecret(params: {
  organizationId: string;
  secretId: string;
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("monitor_secrets")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", params.secretId)
    .eq("organization_id", params.organizationId);
  if (error) throw error;
}

/** List masked secret summaries for a monitor. Never returns ciphertext. */
export async function listSecrets(
  organizationId: string,
  monitorId: string,
): Promise<SecretSummary[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("monitor_secrets")
    .select("id, secret_type, header_name, masked_label, created_at, rotated_at")
    .eq("organization_id", organizationId)
    .eq("monitor_id", monitorId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    secretType: r.secret_type,
    headerName: r.header_name,
    maskedLabel: r.masked_label,
    createdAt: r.created_at,
    rotatedAt: r.rotated_at,
  }));
}
