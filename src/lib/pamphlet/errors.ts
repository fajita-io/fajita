export class PamphletError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "PamphletError";
    this.code = code;
  }
}

export class PamphletCapabilityUnavailableError extends PamphletError {
  constructor(capability: string, reason: string) {
    super(
      "capability_unavailable",
      `Pamphlet capability "${capability}" is unavailable: ${reason}`,
    );
    this.name = "PamphletCapabilityUnavailableError";
  }
}

export class PamphletNotConfiguredError extends PamphletError {
  constructor() {
    super(
      "not_configured",
      "Pamphlet credentials are not configured in this environment.",
    );
    this.name = "PamphletNotConfiguredError";
  }
}

export class PamphletTimeoutError extends PamphletError {
  constructor(message = "Pamphlet request timed out.") {
    super("timeout", message);
    this.name = "PamphletTimeoutError";
  }
}

export class PamphletRateLimitedError extends PamphletError {
  constructor(message = "Pamphlet rate limit reached.") {
    super("rate_limited", message);
    this.name = "PamphletRateLimitedError";
  }
}

export class PamphletInvalidResponseError extends PamphletError {
  constructor(message = "Pamphlet returned an invalid response.") {
    super("invalid_response", message);
    this.name = "PamphletInvalidResponseError";
  }
}
