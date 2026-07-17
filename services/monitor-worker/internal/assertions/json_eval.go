package assertions

import (
	"fmt"
	"strconv"
	"strings"

	contracts "github.com/fajita-io/monitor-contracts"
)

func evalJSON(spec contracts.MonitorAssertionSpec, ec *EvalContext, o Outcome) Outcome {
	root, valid := ec.jsonRoot()
	if !valid {
		return fail(o, spec.FieldPath, "invalid json", "response is not valid JSON")
	}
	segs := parsePath(spec.FieldPath)
	if segs == nil && spec.FieldPath != "" {
		return fail(o, spec.FieldPath, "", "invalid JSON path")
	}
	value, found := navigate(root, segs)

	switch spec.AssertionType {
	case contracts.AssertJSONPathExists:
		if found {
			return pass(o, "path exists", spec.FieldPath)
		}
		return fail(o, "path exists", "missing", "JSON path not found")

	case contracts.AssertJSONPathNotExists:
		if !found {
			return pass(o, "path absent", spec.FieldPath)
		}
		return fail(o, "path absent", "present", "JSON path unexpectedly present")
	}

	if !found {
		return fail(o, spec.ExpectedValue, "missing", "JSON path not found")
	}

	switch spec.AssertionType {
	case contracts.AssertJSONPathEquals:
		if jsonEquals(value, spec) {
			return pass(o, spec.ExpectedValue, valueToString(value))
		}
		return fail(o, spec.ExpectedValue, valueToString(value), "value mismatch")

	case contracts.AssertJSONPathNotEquals:
		if !jsonEquals(value, spec) {
			return pass(o, "!= "+spec.ExpectedValue, valueToString(value))
		}
		return fail(o, "!= "+spec.ExpectedValue, valueToString(value), "value unexpectedly equal")

	case contracts.AssertJSONNumberGT, contracts.AssertJSONNumberGTE,
		contracts.AssertJSONNumberLT, contracts.AssertJSONNumberLTE:
		return evalJSONNumber(spec, value, o)

	case contracts.AssertJSONContainsStr:
		return evalJSONContains(spec, value, o)

	case contracts.AssertJSONBoolTrue:
		if b, ok := value.(bool); ok && b {
			return pass(o, "true", "true")
		}
		return fail(o, "true", valueToString(value), "value is not boolean true")

	case contracts.AssertJSONBoolFalse:
		if b, ok := value.(bool); ok && !b {
			return pass(o, "false", "false")
		}
		return fail(o, "false", valueToString(value), "value is not boolean false")
	}

	return fail(o, spec.ExpectedValue, valueToString(value), "unsupported assertion")
}

func evalJSONNumber(spec contracts.MonitorAssertionSpec, value any, o Outcome) Outcome {
	got, ok := toNumber(value)
	if !ok {
		return fail(o, spec.ExpectedValue, valueToString(value), "value is not numeric")
	}
	want, err := strconv.ParseFloat(strings.TrimSpace(spec.ExpectedValue), 64)
	if err != nil {
		return fail(o, spec.ExpectedValue, valueToString(value), "invalid numeric threshold")
	}
	var okCmp bool
	var sym string
	switch spec.AssertionType {
	case contracts.AssertJSONNumberGT:
		okCmp, sym = got > want, ">"
	case contracts.AssertJSONNumberGTE:
		okCmp, sym = got >= want, ">="
	case contracts.AssertJSONNumberLT:
		okCmp, sym = got < want, "<"
	case contracts.AssertJSONNumberLTE:
		okCmp, sym = got <= want, "<="
	}
	exp := fmt.Sprintf("%s %s", sym, spec.ExpectedValue)
	if okCmp {
		return pass(o, exp, valueToString(value))
	}
	return fail(o, exp, valueToString(value), "numeric comparison failed")
}

func evalJSONContains(spec contracts.MonitorAssertionSpec, value any, o Outcome) Outcome {
	switch v := value.(type) {
	case string:
		if strings.Contains(v, spec.ExpectedValue) {
			return pass(o, "contains "+spec.ExpectedValue, valueToString(value))
		}
	case []any:
		for _, item := range v {
			if s, ok := item.(string); ok && s == spec.ExpectedValue {
				return pass(o, "contains "+spec.ExpectedValue, "array")
			}
		}
	}
	return fail(o, "contains "+spec.ExpectedValue, valueToString(value), "value does not contain expected")
}

func jsonEquals(value any, spec contracts.MonitorAssertionSpec) bool {
	switch spec.ExpectedValueTy {
	case contracts.ValueNumber:
		got, ok := toNumber(value)
		if !ok {
			return false
		}
		want, err := strconv.ParseFloat(strings.TrimSpace(spec.ExpectedValue), 64)
		return err == nil && got == want
	case contracts.ValueBoolean:
		b, ok := value.(bool)
		if !ok {
			return false
		}
		return strconv.FormatBool(b) == strings.ToLower(strings.TrimSpace(spec.ExpectedValue))
	default:
		return valueToString(value) == spec.ExpectedValue
	}
}

func toNumber(v any) (float64, bool) {
	switch n := v.(type) {
	case float64:
		return n, true
	case int:
		return float64(n), true
	default:
		return 0, false
	}
}

func valueToString(v any) string {
	switch t := v.(type) {
	case string:
		return t
	case float64:
		return strconv.FormatFloat(t, 'f', -1, 64)
	case bool:
		return strconv.FormatBool(t)
	case nil:
		return "null"
	case []any:
		return "array"
	case map[string]any:
		return "object"
	default:
		return fmt.Sprintf("%v", t)
	}
}
