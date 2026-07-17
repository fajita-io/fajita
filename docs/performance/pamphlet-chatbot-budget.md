# Pamphlet chatbot performance budget

| Metric | Target |
| --- | --- |
| Launcher mount | Dynamic import, no SSR block |
| Initial page JS | Chat code not in critical marketing path |
| Time to open panel | < 100ms perceived after click (local UI) |
| Ask API | Bounded retrieval; no full corpus to browser |
| Account tools | Authenticated routes only |
| Streaming | Disabled until Pamphlet stream verified |

Measure after staging deploy. Do not invent CWV numbers.
