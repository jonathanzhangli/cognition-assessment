import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

// Never replace an existing database URL or rotate an existing session secret.
try {
  writeFileSync(".env", `DATABASE_URL="file:./dev.db"\nAUTH_SECRET="${randomBytes(32).toString("base64")}"\n`, {
    flag: "wx",
    mode: 0o600,
  });
} catch (error) {
  if (error.code !== "EEXIST") throw error;
}
