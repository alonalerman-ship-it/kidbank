import { createHash } from "crypto";

export function getSitePasswordToken(password: string) {
  return createHash("sha256").update(`kidbank:${password}`).digest("hex");
}

