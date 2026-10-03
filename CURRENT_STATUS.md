# Skyline SSA — Current Status

Last audited: 2026-10-04

## Audit scope

- Audited the active client, relevant service wrappers, API route/controller/model contracts, and project context documents.
- The current docs are `context/00_PROJECT_OVERVIEW.md`, `context/01_PROJECT_RULES.md`, `context/03_API_ENDPOINTS.md`, and `context/04_PAGES_AND_COMPONENTS.md`; the alternate overview/permission filenames from the original task are absent.
- Backend changes are limited to event-specific volunteering, approved-assignee permissions for event attendee scanning, event association on expense claims, and the missing `User` model import required by event-manager assignment. No unrelated backend behavior or existing API request shapes were changed; the expense API adds an optional event reference.

## Frontend fixes

- Project lists and project boards now show non-officers only tasks assigned to their own account; officers retain the full board. Project summaries for other users are based only on their assigned tasks.
- Team/board member cards now use an accessible hover/focus reveal treatment inspired by the supplied reference, using existing initials and roles rather than invented profile photos or social links.
- Added event create, edit, and delete controls for officers; event managers and creators can edit their own assigned event. Officers can assign/remove managers in the UI and authorized users can load attendee/check-in lists.
- Role context now discovers current published event assignments and exposes scoped event-manager scanner access.
- Corrected frontend HTTP methods to use existing PATCH routes for event, manager, member-role, order-status, product, project, task, and expense updates.
- Corrected merch catalogue fields and category filters to match Product (`name`, `image`, backend category enum); order checkout now sends the existing `{ productId, variant: { size, color }, quantity }` contract.
- Corrected order display/status actions to match the existing single-product order shape and `placed → confirmed → ready → collected` statuses.
- Corrected inventory updates to submit a variant index (not nonexistent SKU) and PATCH the existing stock endpoint.
- Corrected project progress to consume server-provided `totalTasks`, `doneTasks`, and `progress`; task creation now submits string supplies and allows volunteer assignment.
- Expense submission can associate a claim with an existing project/event workspace. The treasury dashboard reads `totalExpenses`, shows actual ledger-entry count rather than an unavailable active-member count, and calculates per-event ticket income plus reimbursed event/project-linked expenses from existing APIs.
- Membership activation now uses the existing `memberService.payDues()` API wrapper, validates the returned active user, synchronizes that API response into `AuthContext`, prevents repeat payment while membership is active, and shows actual active/expiry state. The copy now reflects the API's immediate simulated $25 activation rather than promising a review that does not exist.
- Header membership links now show “Membership active” for active accounts and “Join the club” for accounts without active membership.
- Event details distinguish ticket RSVP and global volunteer roles from event-specific volunteering; applications now use persisted event/user records and actual API statuses.
- Merchandise cards now use distinct local images for hoodie, bottle, cap, T-shirt, and sticker products when the API image is missing or repeated; unique API-provided images are preserved.
- Perks cards now use the orange primary color only on hover/focus instead of highlighting the first card permanently.
- Added event-scoped volunteer application records, member history, event-manager/officer review, approve/reject, optional responsibility, and post-event completion through the new volunteer endpoints. Duplicate applications are rejected, rejected applicants may reapply, and completion is permitted only after the event ends.
- Added the protected My Volunteering page and event-specific application status/action to Event Details. A user's global `volunteer` role remains separate from each event application. The page uses styled router links supported by the existing Base UI button component rather than passing it an unsupported `asChild` prop.
- Added a Home navigation link and changed the desktop/mobile header inner layout to use the full available width.
- Replaced header, footer, and login brand marks with the supplied Skyline Student Club logo asset; grouped authenticated routes into a Workspace menu so the primary navigation stays usable at desktop widths.
- Refreshed the event directory into responsive, searchable event cards with date, venue/time, price, availability, and existing RSVP/manage actions; the alumni event now has a dedicated alumni-connection presentation.
- Approved and completed volunteering records expose event-specific ticket-scanner and reimbursement shortcuts. Event assignment is checked server-side when the attendee list is fetched, each ticket is scanned, and each event expense is submitted. Members can see their own expense history regardless of global role.
- Event expense claims now persist a direct event reference, plus the event's linked project when one exists. Approved or completed assignees can submit event claims; Treasurer/Officer review and reimbursement remain on existing workflows.
- The My Claims page is available to authenticated members. Expense submission from an event assignment carries the event reference and remains enforced by the API.

## Remaining backend/API limitations

- Event managers can create tasks only in projects linked to events they manage, and each new task must be assigned to a global Volunteer. Event-manager permissions do not include task edit/delete; assigned-user status changes and Officer task management remain as before.
- Existing event-finance APIs do not provide a direct event ID for manual transactions or merchandise orders. Event financial summaries include ticket revenue and reimbursed claims linked directly to the event or through its linked project; unrelated manual income/expenses and merch revenue cannot be reliably attributed to an event without backend/API changes.
- The treasury summary endpoint does not return an active-member count. That card now displays the existing `transactionCount`; no unsupported member count is fabricated.
- Event volunteering is represented separately from the global `User.role`; `completed` is an event-manager confirmation after the scheduled event end, not a scanner-derived attendance result.
- Event-specific volunteer authority remains scoped to the assigned event. It does not grant global Officer/Treasurer permissions or access to other events.
- The Alumni Career Panel event/API contains no speaker identities or alumni social-profile fields/URLs. The event now includes LinkedIn and Instagram search icons for Skyline alumni; direct speaker profile links still require real URLs and are not fabricated.

## Verification

- `npm run build` in `client/`: passed after the changes. Existing Vite warnings remain for the unrelated parent Svelte tsconfig and large bundle size.
- `npx tsc --noEmit` in `client/`: passed.
- `npm run lint` in `client/`: passed with existing warnings; no lint failures.
- Registration failure was traced to the API server not running: Vite proxied `/api/auth/register` to port 5000 and received an empty HTTP 500 response, which caused the previous JSON parsing error.
- Improved the auth response handling to report empty, invalid, and unreachable API responses clearly. Started the existing backend without changing its code; `/api/health` and the frontend were both reachable.
- Verified a valid registration through the frontend proxy returned HTTP 201. The temporary test account was deleted after verification.
- Start both processes for local development: `npm run dev` and `npm run dev:server` from the workspace root.
- Membership join audit: confirmed the existing `POST /api/members/pay-dues` endpoint activates membership immediately and returns the updated user.
- Verified seeded student login through `/api/auth/login` (student, active membership) without printing or retaining the returned token in command output. Browser check confirmed active membership/expiry appears, and header/footer now say “Membership active” / “View membership” instead of Join.
- Latest client production build and TypeScript check passed. Targeted Oxlint passed with the existing `only-export-components` warning for `AuthContext.jsx`; full lint passed with existing warnings.
- Did not submit dues in live data to avoid creating an unnecessary treasury transaction.
- Volunteering integration checks passed against the running API: independent applications for two events, duplicate rejection (409), member-only history, student/manager access control, approve/reject, responsibility persistence, rejected-user reapplication, and post-event completion. Early completion was correctly rejected (400).
- Browser smoke test confirmed the student sees Home and My Volunteering navigation, can open an event and apply, sees “Application Pending,” and sees the record grouped under pending applications. The temporary test application and API-created test users/events were removed.
- Final client production build and `npx tsc --noEmit` passed. Targeted Oxlint completed; React effect/dependency warnings remain in the new `MyVolunteering.jsx` and existing `events-section.tsx`. The build still reports the unrelated parent Svelte tsconfig warning and large-bundle warning.
- Backend `node --check` passed for the modified controller, routes, and model. Existing backend server was used for integration tests; no additional server process was started.
- The prior logo, events-page, and alumni social work was frontend-only. The latest volunteering authorization change also touched `server/` only for event-scoped ticket and expense authorization plus the expense event reference; unrelated backend files and seed data were not changed.
- Verified the supplied logo loads at its native dimensions in the browser, the authenticated Workspace menu exposes the user's existing routes, and event search narrows to the alumni card/detail.
- A read-only request using an existing Volunteer account confirmed the current event-ticket-list API returns HTTP 200 and its attendee/check-in summary. No live ticket was scanned or expense claim submitted during verification.
- Current targeted Oxlint warnings are limited to state updates in effects and existing hook dependencies in `MyVolunteering.jsx`, `Scanner.jsx`, and `events-section.tsx`; there are no lint errors.
- Final browser smoke test using a temporary approved event-volunteer fixture confirmed the member's “My Volunteering” record and its scan/expense actions, the event-scoped scanner and attendee count, and the event-specific expense form/context. No ticket was scanned and no expense was submitted. The temporary event, application, and ticket were removed and verified absent afterward.
- Added the supplied poster artwork as the app's startup splash, with a short display, accessible continue button, and no indefinite wait on auth/network loading. Added `USER_WORKFLOWS.md` as an implementation-grounded role/user guide and audited its route/permission claims against the current frontend and backend.
- The workflow audit records mismatches in the older page inventory and remaining gaps in project task read scoping, event-manager task edit/delete permissions, Treasurer scanning, and demo-only dues activation.
- Verified the splash asset loads at 768×1152 and its Enter Skyline button reveals the app; frontend production build passed, `npm run lint` completed with existing warnings and no diagnostics in the changed app/splash files, and editor diagnostics reported no errors in those files.
- Event/project task creation is now limited server-side to Officers or the manager of the project's linked event; event-manager assignees must have the global Volunteer role. Event managers can find their linked project from Projects and select Volunteer-role event applicants. Event listing and detail views display both member and non-member prices with the current user's applicable price identified.
- Task-controller integration check passed: a linked-event manager creating a task for a Volunteer returned 201; assigning a Student returned 400; an unrelated Student manager attempt returned 403; and existing Officer assignment behavior remained available. All temporary integration records were removed.
- Browser verification confirmed the splash image spans the full viewport width, and both event cards and event-detail modal display member and non-member prices.
- Removed the startup splash at the user's request; the app now opens directly into its normal routed interface.
- Final client production build and backend task-controller syntax check passed. Targeted lint completed with existing unused-import and React effect/dependency warnings; editor diagnostics reported no errors in the changed files.
