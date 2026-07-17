package executor

import contracts "github.com/fajita-io/monitor-contracts"

// statusForCategory maps a failure category to the overall result status.
func statusForCategory(cat contracts.FailureCategory) contracts.ResultStatus {
	switch cat {
	case "":
		return contracts.StatusSuccess
	case contracts.FailBlockedDest, contracts.FailUnsupportedScheme, contracts.FailRedirectBlocked:
		return contracts.StatusBlocked
	case contracts.FailConnectTimeout, contracts.FailResponseTimeout:
		return contracts.StatusTimedOut
	case contracts.FailCanceled:
		return contracts.StatusCanceled
	case contracts.FailUnexpectedStatus, contracts.FailAssertion, contracts.FailResponseTooLarge,
		contracts.FailTLSExpired, contracts.FailTLSHostname, contracts.FailRedirectLimit,
		contracts.FailInvalidJSON, contracts.FailHeartbeatMissed:
		return contracts.StatusFailure
	default:
		return contracts.StatusError
	}
}

// retryable reports whether a category is worth a transient retry.
func retryable(cat contracts.FailureCategory) bool {
	switch cat {
	case contracts.FailConnReset, contracts.FailConnectTimeout, contracts.FailResponseTimeout,
		contracts.FailDNS:
		return true
	default:
		return false
	}
}

// safeMessage returns a customer-safe message for a category. Raw Go errors are
// never surfaced.
func safeMessage(cat contracts.FailureCategory) string {
	switch cat {
	case "":
		return ""
	case contracts.FailDNS:
		return "The hostname could not be resolved."
	case contracts.FailBlockedDest:
		return "The destination address is not permitted."
	case contracts.FailConnRefused:
		return "The connection was refused."
	case contracts.FailConnReset:
		return "The connection was reset."
	case contracts.FailConnectTimeout:
		return "The connection timed out."
	case contracts.FailTLS:
		return "The TLS handshake failed."
	case contracts.FailTLSExpired:
		return "The TLS certificate has expired."
	case contracts.FailTLSHostname:
		return "The TLS certificate does not match the hostname."
	case contracts.FailResponseTimeout:
		return "The response timed out."
	case contracts.FailUnexpectedStatus:
		return "The response returned an unexpected status code."
	case contracts.FailResponseTooLarge:
		return "The response exceeded the size limit."
	case contracts.FailInvalidJSON:
		return "The response was not valid JSON."
	case contracts.FailAssertion:
		return "One or more assertions failed."
	case contracts.FailRedirectBlocked:
		return "A redirect pointed to a blocked destination."
	case contracts.FailRedirectLimit:
		return "The redirect limit was exceeded."
	case contracts.FailUnsupportedScheme:
		return "The URL scheme is not supported."
	case contracts.FailInvalidConfig:
		return "The monitor configuration is invalid."
	case contracts.FailHeartbeatMissed:
		return "The heartbeat was not received in time."
	default:
		return "The check could not be completed."
	}
}
