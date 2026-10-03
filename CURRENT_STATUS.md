# Skyline SSA — Current Status

Last audited: 2026-10-03

## Audit scope

- Audited the active client, relevant service wrappers, API route/controller/model contracts, and project context documents.
- The current docs are `context/00_PROJECT_OVERVIEW.md`, `context/01_PROJECT_RULES.md`, `context/03_API_ENDPOINTS.md`, and `context/04_PAGES_AND_COMPONENTS.md`; the alternate overview/permission filenames from the original task are absent.
- **No backend files, routes, controllers, models, middleware, seed data, endpoints, or API contracts were modified.**

## Frontend fixes

- Added event create, edit, and delete controls for officers; event managers and creators can edit their own assigned event. Officers can assign/remove managers in the UI and authorized users can load attendee/check-in lists.
- Role context now discovers current published event assignments and exposes scoped event-manager scanner access.
- Corrected frontend HTTP methods to use existing PATCH routes for event, manager, member-role, order-status, product, project, task, and expense updates.
- Corrected merch catalogue fields and category filters to match Product (`name`, `image`, backend category enum); order checkout now sends the existing `{ productId, variant: { size, color }, quantity }` contract.
- Corrected order display/status actions to match the existing single-product order shape and `placed → confirmed → ready → collected` statuses.
- Corrected inventory updates to submit a variant index (not nonexistent SKU) and PATCH the existing stock endpoint.
- Corrected project progress to consume server-provided `totalTasks`, `doneTasks`, and `progress`; task creation now submits string supplies and allows volunteer assignment.
- Expense submission can associate a claim with an existing project/event workspace. The treasury dashboard reads `totalExpenses`, shows actual ledger-entry count rather than an unavailable active-member count, and calculates per-event ticket income plus reimbursed project-linked expenses from existing APIs.

## Existing backend blockers (left unchanged by request)

- `server/controllers/eventController.js` uses `User.findById` in manager assignment without importing `User`. As a result, the new Add/Remove Event Manager controls will receive a server error until that backend reference is corrected.
- Event-manager permissions for linked project task create/update/delete are not consistently supported by the existing task routes/controller. The documented event-manager project-task scope cannot be made functional solely in the frontend without changing backend authorization.
- Existing event-finance APIs do not provide a direct event ID for manual transactions or merchandise orders. Event financial summaries therefore include ticket revenue and reimbursed claims linked through the event's project; unrelated manual income/expenses and merch revenue cannot be reliably attributed to an event without backend/API changes.
- The treasury summary endpoint does not return an active-member count. That card now displays the existing `transactionCount`; no unsupported member count is fabricated.

## Verification

- `npm run build` in `client/`: passed after the changes. Existing Vite warnings remain for the unrelated parent Svelte tsconfig and large bundle size.
- `npx tsc --noEmit` in `client/`: passed.
- `npm run lint` in `client/`: passed with existing warnings; no lint failures.
- Registration failure was traced to the API server not running: Vite proxied `/api/auth/register` to port 5000 and received an empty HTTP 500 response, which caused the previous JSON parsing error.
- Improved the auth response handling to report empty, invalid, and unreachable API responses clearly. Started the existing backend without changing its code; `/api/health` and the frontend were both reachable.
- Verified a valid registration through the frontend proxy returned HTTP 201. The temporary test account was deleted after verification.
- Start both processes for local development: `npm run dev` and `npm run dev:server` from the workspace root.
