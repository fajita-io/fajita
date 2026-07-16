export type DataFastGoalParams = Record<string, string>;

export type DataFastFn = (
  goal: string,
  params?: DataFastGoalParams,
) => void;

declare global {
  interface Window {
    datafast?: DataFastFn & { q?: unknown[] };
  }
}

export {};
