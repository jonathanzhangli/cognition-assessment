# Folio: internal operations workspace

Folio is a Power Apps replacement prototype for a fintech operations team. Refunds is the first application; authentication, navigation, approvals, and audit history belong to the platform. No refund moves real money.

## Quickstart

Use Node.js **22.12+ on the 22.x line, 24.x, or 26+**, and npm. From the repository root:

```sh
npm install && npm run setup && npm run dev
```

Open <http://localhost:3000>. Setup creates a local `.env` with a random `AUTH_SECRET` and `DATABASE_URL="file:./dev.db"`, applies the committed SQLite migration, and seeds 4 users, 20 customers, 50 transactions, and 10 refunds. Subsequent setup runs preserve existing demo activity. Neither the environment file nor the SQLite database is checked in.

| Email | Name | Access |
| --- | --- | --- |
| `agent@demo.com` | Alice Morgan | Request and execute refunds |
| `agent2@demo.com` | Evan Lee | Request and execute refunds |
| `manager@demo.com` | Maya Brooks | Agent access plus the approvals inbox |
| `admin@demo.com` | Alex Silva | Manager access plus the cross-app audit log |

All four demo accounts use **`password123`**. Use only with local demo data.

## Five-step demo

Start with a fresh seed. The first three transactions have $3,000.00 available each. Use **Sign out** in the header to switch roles.

1. **Agent: take both paths.** Sign in as `agent@demo.com`. Open **Refunds → New refund**, search `TX-1001` (Avery Chen), select the transaction, enter `1200.00` and a reason, and create it. The detail page says **Pending approval** and has no execute button. Repeat with `TX-1002` (Morgan Reed) and `200.00`: this one is immediately **Approved** and its audit trail says **created: auto-approved**.
2. **Manager: approve someone else's request.** Sign in as `manager@demo.com`. In **Approvals**, find **$1,200.00 refund for Avery Chen**, enter a comment, and choose **Approve**. The request moves to **Recently decided**. Follow its link to see the approved refund and your comment.
3. **Manager: try to approve your own.** Create an `800.00` refund on `TX-1003` (Sam Rivera). In **Approvals**, click **Approve** on your own request. The server returns **You cannot decide your own request.** The request remains pending; another manager or admin must decide it.
4. **Agent: execute and check permissions.** Switch back to `agent@demo.com`. Filter the refund ledger to **Approved**, open Avery Chen's **$1,200.00** refund, and choose **Execute refund**. It becomes **Refunded**, the button disappears, and the refunded totals increase. Visit `/approvals` and `/audit` directly: both show **Access denied**.
5. **Admin: trace the money.** Sign in as `admin@demo.com` and open **Audit log**. Select `refund` and **Filter**. Inspect the $1,200 request's creation, approval, and execution snapshots and actors, plus the separate $200 auto-approval. Filter to `approval` to see the inbox request and its decision. Events are newest first; all displayed times and the “today” metric use UTC.

## How it fits together

- **Shell:** Next.js App Router server components live under `src/app/(shell)`. Middleware redirects unauthenticated visitors to `/login`. Auth.js v5 checks bcrypt-hashed credentials and stores the user's ID, email, name, and role in the JWT session. Pages and server actions check access independently of the sidebar.
- **App directory:** `src/apps/registry.ts` is the single list used by the home page and sidebar. The role-filtered entry points to the app's pages; it doesn't grant write permission.
- **Approvals:** `src/lib/approvals.ts` owns requests, role checks, the no-self-decision rule, and the pending-only transition. Its handler table maps entity types to a detail URL and a decision callback. The request update, audit event, and owning app's transition share one Prisma transaction.
- **Refund ledger:** `src/apps/refunds/rules.ts` checks integer cents against the unreserved balance and the $500 threshold. Pending, approved, and executed refunds all consume balance; rejected ones do not. Only an approved refund can execute. `service.ts` reads the balance and writes the refund inside the same transaction. Status-conditional writes prevent a second decision or execution.
- **Audit:** `logAudit` writes before/after JSON alongside the business mutation. The admin log spans all entities; each refund detail page shows only that refund and its associated approval events. There is no audit editing UI.

See [Adding an app](./ADDING_AN_APP.md) for the extension checklist and a KYC queue prompt.

## Checks

```sh
npm test        # pure rule and integer-money checks; no database needed
npm run lint
npm run build
npm start      # serve the production build locally
```

## Not production-ready yet

- Replace demo credentials with Entra ID or Okta SSO via an Auth.js provider. Remove the seeded accounts and public credential hints.
- Replace SQLite with Postgres, choose transaction isolation explicitly, and exercise concurrent balance reservations and decisions under load.
- Integrate a real payment provider with idempotency keys and reconciliation before marking a refund as paid.
- Decide on hosting and deployment, configure HTTPS and trusted host/proxy headers, and run migrations and backups as deployment steps.
- Move secrets into a managed secret store; plan rotation, audit retention, and restricted database access.
- Add rate limiting to sign-in and sensitive writes before exposing the app outside a local environment.
