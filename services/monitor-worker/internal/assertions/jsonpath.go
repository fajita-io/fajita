package assertions

import (
	"strconv"
	"strings"
)

// maxPathSegments bounds a JSON path so a pathological path cannot drive
// unbounded traversal. The path string itself is bounded by the database.
const maxPathSegments = 64

type segment struct {
	key     string
	index   int
	isIndex bool
}

// parsePath parses a documented JSON-path subset: dot-separated keys with
// optional bracket indices, e.g. "data.items[0].status". No filters, wildcards,
// expressions, or scripts are supported. Returns nil for an invalid path.
func parsePath(path string) []segment {
	if path == "" {
		return nil
	}
	path = strings.TrimPrefix(path, "$")
	path = strings.TrimPrefix(path, ".")
	var segs []segment
	for _, part := range strings.Split(path, ".") {
		if part == "" {
			continue
		}
		// Split key and any bracket indices: name[0][1]
		name := part
		if b := strings.IndexByte(part, '['); b >= 0 {
			name = part[:b]
			rest := part[b:]
			if name != "" {
				segs = append(segs, segment{key: name})
			}
			for len(rest) > 0 {
				close := strings.IndexByte(rest, ']')
				if close <= 0 {
					return nil
				}
				idx, err := strconv.Atoi(rest[1:close])
				if err != nil || idx < 0 {
					return nil
				}
				segs = append(segs, segment{index: idx, isIndex: true})
				rest = rest[close+1:]
			}
		} else {
			segs = append(segs, segment{key: name})
		}
		if len(segs) > maxPathSegments {
			return nil
		}
	}
	return segs
}

// navigate walks a decoded JSON value along the parsed path.
func navigate(root any, segs []segment) (any, bool) {
	cur := root
	for _, s := range segs {
		if s.isIndex {
			arr, ok := cur.([]any)
			if !ok || s.index >= len(arr) {
				return nil, false
			}
			cur = arr[s.index]
			continue
		}
		obj, ok := cur.(map[string]any)
		if !ok {
			return nil, false
		}
		v, exists := obj[s.key]
		if !exists {
			return nil, false
		}
		cur = v
	}
	return cur, true
}
