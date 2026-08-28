/**
 * Fictional customer used in marketing demos. One consistent world across
 * interactive journeys, coverage explorer, monitor preview, and status pages.
 */
export const demoBrand = {
  name: "Genius",
  domain: "genius.ly",
  url: "https://genius.ly",
  apiHost: "api.genius.ly",
  statusHost: "status.genius.ly",
  alertEmail: "team · genius.ly",
  /** Single-letter mark in status page masthead */
  mark: "G",
} as const;

export const demoEndpoints = {
  site: {
    label: demoBrand.domain,
    url: demoBrand.url,
  },
  apiHealth: {
    label: `${demoBrand.apiHost}/v1/health`,
    url: `https://${demoBrand.apiHost}/v1/health`,
  },
  apiOrders: {
    url: `https://${demoBrand.apiHost}/v1/orders`,
  },
  tls: {
    label: `${demoBrand.domain}:443`,
  },
} as const;
