import { describe, expect, it } from "vitest";
import { assertExecutable, decidedStatus, initialStatus } from "../src/apps/refunds/rules";
import { money, parseCents } from "../src/lib/format";
import { assertCanDecide } from "../src/lib/rules";

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
