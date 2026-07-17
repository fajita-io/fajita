const INJECTION_PATTERNS: Array<{ reason: string; re: RegExp }> = [
  { reason: "ignore_instructions", re: /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i },
  { reason: "reveal_system_prompt", re: /(?:show|reveal|print|dump)\s+(?:the\s+)?(?:system\s+)?prompt/i },
  { reason: "reveal_hidden_context", re: /(?:show|reveal)\s+(?:hidden|internal)\s+(?:context|tools|instructions)/i },
  { reason: "cross_tenant", re: /(?:switch|show|access)\s+(?:another|other|all)\s+organizations?/i },
  { reason: "act_as_admin", re: /(?:act|pretend|roleplay)\s+as\s+(?:an?\s+)?(?:admin|administrator|human\s+agent)/i },
  { reason: "bypass_policy", re: /bypass\s+(?:support\s+)?policy/i },
  { reason: "run_internal_tool", re: /run\s+(?:the\s+)?(?:internal|hidden)\s+tool/i },
  { reason: "reveal_secrets", re: /(?:reveal|show|print)\s+(?:the\s+)?(?:slack\s+token|api\s+key|secret|webhook)/i },
  { reason: "destructive_action", re: /(?:cancel\s+my\s+subscription|resolve\s+the\s+incident|issue\s+a\s+refund|approve\s+my\s+affiliate)\s+now/i },
  { reason: "retrieved_override", re: /follow\s+instructions\s+from\s+this\s+(?:retrieved|page|document)/i },
];

export interface InjectionScanResult {
  suspicious: boolean;
  reasons: string[];
}

export function scanPromptInjection(input: string): InjectionScanResult {
  const reasons: string[] = [];
  for (const { reason, re } of INJECTION_PATTERNS) {
    if (re.test(input)) reasons.push(reason);
  }
  return { suspicious: reasons.length > 0, reasons };
}
