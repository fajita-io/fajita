/** True when an alert recipient email belongs to an org member. */
export function emailMatchesOrgMember(email: string, memberEmails: Iterable<string>): boolean {
  const needle = email.trim().toLowerCase();
  if (!needle) return false;
  for (const member of memberEmails) {
    if (member.trim().toLowerCase() === needle) return true;
  }
  return false;
}
