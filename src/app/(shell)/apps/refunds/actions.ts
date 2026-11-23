"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { refundRoles } from "@/apps/registry";
import { createRefund, executeRefund } from "@/apps/refunds/service";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseCents } from "@/lib/format";
import { RuleError } from "@/lib/rules";

export async function requestRefund(_: string, form: FormData) {
  const user = await requireRole(...refundRoles);
  let id: string;
  try {
    const data = {
      transactionId: String(form.get("transactionId") ?? ""),
      reason: String(form.get("reason") ?? ""),
      amountCents: parseCents(String(form.get("amount") ?? "").trim()),
      requestedById: user.id,
    };
    const refund = await db.$transaction(tx => createRefund(tx, data));
    id = refund.id;
  } catch (error) {
    if (error instanceof RuleError) return error.message;
    throw error;
  }
  revalidatePath("/apps/refunds");
  revalidatePath("/approvals");
  revalidatePath("/audit");
  redirect(`/apps/refunds/${id}`);
}

export async function execute(id: string) {
  const user = await requireRole(...refundRoles);
  try {
    await db.$transaction(tx => executeRefund(tx, id, user.id));
  } catch (error) {
    if (error instanceof RuleError) return error.message;
    throw error;
  }
  revalidatePath("/apps/refunds");
  revalidatePath(`/apps/refunds/${id}`);
  revalidatePath("/audit");
  return "";
}
