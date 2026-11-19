import { RuleError } from "./rules";

export function parseCents(value: string): number {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    throw new RuleError("Enter a dollar amount with at most two decimal places.");
  }
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole + fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) throw new RuleError("Amount is too large.");
  return cents;
}

export function money(cents: number) {
  const amount = BigInt(cents);
  return `$${(amount / 100n).toLocaleString("en-US")}.${String(amount % 100n).padStart(2, "0")}`;
}

export function dateTime(value: Date) {
  return value.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    hour12: false, timeZone: "UTC",
  }) + " UTC";
}
