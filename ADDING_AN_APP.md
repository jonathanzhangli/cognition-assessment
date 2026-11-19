# Adding an app to Folio

The shell owns identity, discovery, approvals, and audit. The app owns its records, domain rules, and screens. A new app does not need its own sidebar, sign-in page, or second approvals inbox.

1. **Model the data.** Add Prisma models to `prisma/schema.prisma`. Store money as integer cents and use stable entity IDs. Run `npx prisma migrate dev --name add_<id>`, inspect the SQL, and commit the migration. Add deterministic demo fixtures to the seed if needed.
2. **Register the app.** Add one `{ id, name, href, description, roles }` entry in `src/apps/registry.ts`. The home directory and sidebar will both pick it up.
3. **Create the routes.** Put pages and server actions under `src/app/(shell)/apps/<id>/`. Prefer server components for data reads; use small client components for interactive forms. Call `requireRole` on restricted pages.
4. **Isolate the rules.** Put pure state transitions and validation in `src/apps/<id>/rules.ts`. Test boundaries, disallowed transitions, and role restrictions with Vitest without connecting to a database.
5. **Authorize every action.** Start every app action with `requireRole(...allowedRoles)`. Derive the actor from the session, not submitted fields. Validate all inputs and current record state on the server; hiding a button is not authorization.
6. **Audit every write.** Use `db.$transaction` and pass the same transaction client to the mutation and `logAudit`. Record the actor, action, entity type/ID, and useful before/after snapshots without secrets. A failed mutation should leave neither a change nor a success event.
7. **Reuse approvals.** Call `createApprovalRequest(tx, { entityType, entityId, summary, requestedById })` inside the originating transaction. Register a detail URL and decision callback under the entity type in `approvalHandlers` in `src/lib/approvals.ts`. The callback receives the same transaction client: conditionally update the app record and audit the change. Let `decideApproval` enforce independent manager/admin review, close the request, and call your callback.

## Copy-paste Devin prompt

```text
Build a KYC review queue as the next app in this Folio repo. First read README.md,
ADDING_AN_APP.md, and the Refunds app. Reuse the existing shell, roles, Prisma
client, audit helper, and generic approvals inbox. Do not build another platform.

Model KYC applications with statuses NEW, IN_REVIEW, APPROVED, REJECTED, and
ESCALATED. Agents open NEW applications for review, then approve, reject, or
escalate an IN_REVIEW application. Escalation must create an ApprovalRequest
for an independent manager (or admin under the shared policy); the registered
callback moves the application from ESCALATED to APPROVED or REJECTED.

Add the migration, a role-filtered registry entry, and list/detail pages under
src/app/(shell)/apps/kyc/. Keep transition rules pure and test permitted and
blocked transitions. Guard every action with requireRole and write audit events
in the same transaction as each application write. Use synthetic demo fixtures,
not real identity documents. Run setup, tests, lint, and build; verify the agent
review and manager escalation paths in a browser. Keep the implementation small.
```
