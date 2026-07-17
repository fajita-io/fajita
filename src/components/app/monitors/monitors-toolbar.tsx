"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";

interface Option {
  value: string;
  label: string;
}

/**
 * Search, filter, and sort controls for the monitor list. State lives in the
 * URL query string (shareable, back/forward safe) and never carries sensitive
 * data: only names, ids, and enum values. Search is debounced so typing does
 * not thrash the server.
 */
export function MonitorsToolbar({
  groups,
  tags,
  intervals,
}: {
  groups: Option[];
  tags: Option[];
  intervals: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const debounceRef = useRef<number | null>(null);

  // Keep local input in sync when the URL changes elsewhere (e.g. clear).
  useEffect(() => {
    setSearch(params.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get("q")]);

  function apply(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") sp.delete(key);
      else sp.set(key, value);
    }
    // Any filter change resets pagination.
    sp.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    });
  }

  function onSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => apply({ q: value.trim() || null }), 300);
  }

  const select = (name: string, options: Option[], label: string) => (
    <select
      className="fj-select"
      aria-label={label}
      value={params.get(name) ?? ""}
      onChange={(e) => apply({ [name]: e.target.value || null })}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="fj-mon-toolbar" data-pending={pending ? "" : undefined}>
      <div className="fj-mon-toolbar__search">
        <BrandIcon name="search" size={16} />
        <input
          className="fj-input"
          type="search"
          placeholder="Search by name, host, group, or tag"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search monitors"
        />
      </div>
      <div className="fj-mon-toolbar__filters">
        {select(
          "type",
          [
            { value: "https", label: "Website" },
            { value: "api", label: "API" },
            { value: "ssl", label: "SSL" },
            { value: "heartbeat", label: "Heartbeat" },
          ],
          "All types",
        )}
        {select(
          "status",
          [
            { value: "active", label: "Active" },
            { value: "paused", label: "Paused" },
            { value: "draft", label: "Draft" },
            { value: "archived", label: "Archived" },
          ],
          "All statuses",
        )}
        {select(
          "result",
          [
            { value: "success", label: "Passing" },
            { value: "failure", label: "Failing" },
            { value: "timed_out", label: "Timed out" },
            { value: "blocked", label: "Blocked" },
          ],
          "Any result",
        )}
        {groups.length > 0 ? select("group", groups, "All groups") : null}
        {tags.length > 0 ? select("tag", tags, "All tags") : null}
        {select("interval", intervals, "Any interval")}
        {select(
          "sort",
          [
            { value: "updated", label: "Recently updated" },
            { value: "name", label: "Name" },
            { value: "last_checked", label: "Last checked" },
            { value: "response_time", label: "Response time" },
            { value: "next_check", label: "Next check" },
            { value: "created", label: "Created" },
          ],
          "Sort",
        )}
      </div>
    </div>
  );
}
