import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** Content-ID for the Fajita app icon embedded in outbound mail. */
export const FAJITA_EMAIL_CID = "fajita-app-icon";
/** Content-ID for the Memo app icon embedded in outbound mail. */
export const MEMO_EMAIL_CID = "memo-app-icon";

export const FAJITA_EMAIL_LOGO_SRC = `cid:${FAJITA_EMAIL_CID}`;
export const MEMO_EMAIL_ICON_SRC = `cid:${MEMO_EMAIL_CID}`;

export interface ResendInlineAttachment {
  filename: string;
  content: string;
  content_id: string;
  content_type: "image/png";
}

const BRAND_ASSETS: Array<{ cid: string; file: string }> = [
  { cid: FAJITA_EMAIL_CID, file: "fajita-app-icon.png" },
  { cid: MEMO_EMAIL_CID, file: "memo-app-icon.png" },
];

/** Inline PNG attachments so logos render without relying on hosted URLs. */
export function emailBrandAttachments(): ResendInlineAttachment[] {
  const dir = path.join(process.cwd(), "public", "brand", "email");
  return BRAND_ASSETS.map(({ cid, file }) => {
    const filePath = path.join(dir, file);
    if (!existsSync(filePath)) {
      throw new Error(
        `Missing email brand asset ${file}. Run npm run brand:assets or add public/brand/email/${file}.`,
      );
    }
    return {
      filename: file,
      content: readFileSync(filePath).toString("base64"),
      content_id: cid,
      content_type: "image/png",
    };
  });
}

/** Merge inline brand icons into a Resend send payload. */
export function withEmailBrandAttachments<
  T extends Record<string, unknown>,
>(payload: T): T & { attachments: ResendInlineAttachment[] } {
  return {
    ...payload,
    attachments: emailBrandAttachments(),
  };
}
