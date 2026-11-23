"use server";

import { revalidatePath } from "next/cache";
import { decideApproval } from "@/lib/approvals";
import { requireRole } from "@/lib/auth";
import { RuleError } from "@/lib/rules";

export async function decide(id: string, _: string, form: FormData) {
  const user = await requireRole("manager", "admin");
  const decision = form.get("decision");
  if (decision !== "APPROVED" && decision !== "REJECTED") return "Choose approve or reject.";
  try {
    await decideApproval(id, decision, String(form.get("comment") ?? ""), user);
  } catch (error) {
    if (error instanceof RuleError) return error.message;
    throw error;
  }
  revalidatePath("/", "layout");
  return "";
}
