export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ol"; items: string[] }
  | { type: "ul"; items: string[] };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDocMeta = {
  title: string;
  version: number;
  effectiveDate: string;
  lastUpdated: string;
};
