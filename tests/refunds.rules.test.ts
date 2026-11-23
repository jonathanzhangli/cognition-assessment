import { describe, expect, it } from "vitest";
import { assertExecutable, decidedStatus, initialStatus } from "../src/apps/refunds/rules";
import { money, parseCents } from "../src/lib/format";
import { assertCanDecide } from "../src/lib/rules";
import { dateTime, easternDayAt } from "../src/lib/time";

describe("refund ledger", () => {
  it("auto-approves exactly $500", () => expect(initialStatus(50000, 50000, 0)).toBe("APPROVED"));
  it("requires a decision for $500.01", () => expect(initialStatus(50001, 50001, 0)).toBe("PENDING_APPROVAL"));
  it("does not spend a cent already reserved", () => {
    expect(() => initialStatus(101, 500, 400)).toThrow("remaining");
    expect(initialStatus(100, 500, 400)).toBe("APPROVED");
  });
  it.each([0, -10, 12.5])("rejects invalid cents: %s", amount => {
    expect(() => initialStatus(amount, 100, 0)).toThrow();
  });
  it("round-trips a fractional dollar without rounding", () => {
    expect(money(parseCents("1000.29"))).toBe("$1,000.29");
    expect(() => parseCents("500.001")).toThrow();
  });
  it("only executes an approved refund", () => {
    expect(() => assertExecutable(decidedStatus("APPROVED"))).not.toThrow();
    expect(() => assertExecutable(decidedStatus("REJECTED"))).toThrow();
    expect(() => assertExecutable("REFUNDED")).toThrow();
  });
});

describe("approval authority", () => {
  const request = { requestedById: "requester", status: "PENDING" } as const;
  it("blocks a manager deciding their own request", () => {
    expect(() => assertCanDecide(request, { id: "requester", role: "manager" })).toThrow("own request");
  });
  it("blocks an agent deciding someone else's request", () => {
    expect(() => assertCanDecide(request, { id: "peer", role: "agent" })).toThrow("managers and admins");
  });
  it.each(["APPROVED", "REJECTED"] as const)("blocks deciding a %s request", status => {
    expect(() => assertCanDecide({ ...request, status }, { id: "peer", role: "admin" })).toThrow("already");
  });
  it("allows an independent manager", () => {
    expect(() => assertCanDecide(request, { id: "peer", role: "manager" })).not.toThrow();
  });
});

describe("Eastern ledger dates", () => {
  it.each([
    ["2026-03-08T18:00:00Z", "2026-03-08T05:00:00.000Z"], // spring-forward day starts in EST
    ["2026-11-01T18:00:00Z", "2026-11-01T04:00:00.000Z"], // fall-back day starts in EDT
    ["2026-07-01T03:59:59Z", "2026-06-30T04:00:00.000Z"], // still yesterday in New York
    ["2026-07-01T04:00:00Z", "2026-07-01T04:00:00.000Z"],
  ])("counts today's refunds from Eastern midnight at %s", (instant, midnight) => {
    expect(easternDayAt(new Date(instant), 0, 0).toISOString()).toBe(midnight);
  });
  it("keeps seed events at the same wall-clock hour across a clock change", () => {
    const now = new Date("2026-03-09T12:00:00Z");
    expect(dateTime(easternDayAt(now, 2, 10))).toContain("10:00 EST");
    expect(dateTime(easternDayAt(now, 1, 10))).toContain("10:00 EDT");
  });
});
