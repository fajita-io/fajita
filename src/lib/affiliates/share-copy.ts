/**
 * Ready-to-use affiliate share snippets. Link must already include the caller's
 * tracking code. Copy stays honest: no fabricated metrics or guarantees.
 */

export interface ShareSnippet {
  label: string;
  value: string;
}

export function buildAffiliateShareSnippets(link: string): ShareSnippet[] {
  return [
    {
      label: "One-liner",
      value: `Fajita watches your sites, APIs, and cron jobs and tells you before your customers do. ${link}`,
    },
    {
      label: "Short post",
      value: `Downtime is expensive and quiet. Fajita monitors your websites, APIs, SSL certificates, and cron jobs, then alerts your team the moment something starts to slip. Try it: ${link}`,
    },
    {
      label: "For a newsletter",
      value: `I run my uptime monitoring on Fajita. It checks sites, APIs, certificates, and scheduled jobs, and it pings me before anything reaches a customer. Public status pages come built in. If you own something that has to stay up, take a look: ${link}`,
    },
  ];
}
