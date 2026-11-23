import { TZDateMini } from "@date-fns/tz";

const eastern = "America/New_York";
const options: Intl.DateTimeFormatOptions = {
  timeZone: eastern, timeZoneName: "short", hourCycle: "h23",
  month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
};
const display = new Intl.DateTimeFormat("en-US", options);
const preciseDisplay = new Intl.DateTimeFormat("en-US", {
  ...options, second: "2-digit", fractionalSecondDigits: 3,
});

export function dateTime(value: Date, precise = false) {
  return (precise ? preciseDisplay : display).format(value);
}

// Resolve the offset on the target calendar day, not the offset at reference time.
export function easternDayAt(reference: Date, daysAgo: number, hour: number) {
  const local = new TZDateMini(reference, eastern);
  return new Date(new TZDateMini(local.getFullYear(), local.getMonth(), local.getDate() - daysAgo, hour, eastern).getTime());
}
