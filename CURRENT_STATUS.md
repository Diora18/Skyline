# Skyline SSA — Current Status

Last audited: 2026-10-03

## Repository and documentation

- The active application is a React/Vite client in `client/` and an Express/MongoDB server in `server/`.
- The requested files `context/01_PROJECT_OVERVIEW.md` and `context/04_USER_ROLES_AND_PERMISSIONS.md` are not present. The current references are `context/00_PROJECT_OVERVIEW.md`, `context/01_PROJECT_RULES.md`, `context/03_API_ENDPOINTS.md`, and `context/04_PAGES_AND_COMPONENTS.md`.
- The four global roles are `student`, `volunteer`, `treasurer`, and `officer`. Membership status is separate from role and controls member pricing and merch checkout.
- No backend files, API contracts, models, routes, middleware, or seed data were changed.
- Added a workspace-level `package.json` so npm commands from the provided `SKYLINE` folder resolve to the nested Skyline application instead of the unrelated `C:\Users\vedan` Svelte/Vite project.

## Workspace commands

Run these from the top-level `SKYLINE` folder:

- `npm run dev` — start the frontend Vite server.
- `npm run dev:server` — start the backend Express server.
- `npm run build` / `npm run lint` — run the client build or lint.
- `npm run seed` — run the existing backend seeder. **This drops all collections in the configured MongoDB database before inserting demo data.**

## Role-based frontend status

| Role | Frontend access and controls |
| --- | --- |
| Student | Public events, merch browsing, announcements, and other public pages; authenticated tickets, orders, and projects. Active membership is required for merch checkout. No administrative controls. |
| Volunteer | Student/member functionality, scanner access, submitting and viewing their expense claims, and marking only their own assigned project tasks done. |
| Treasurer | Student/member functionality, treasury and expense-review pages, and submitting/viewing their own expense claims. Scanner access is not shown because the role matrix reserves it for Volunteers and Officers. |
| Officer | Shared functionality plus member administration, order fulfillment, inventory, announcement publishing/deletion, project/task management, scanner, treasury, and expense review. |

Project routes now require authentication. Restricted pages are guarded at the route level, with matching role-specific navigation. A personal expense-claims page uses the existing `/api/expenses/my` endpoint.

The expense submission and review UI now follows existing backend fields, category/status values, and PATCH review/reimbursement routes. Public merch browsing remains available; checkout directs users to sign in or activate/renew membership when required.

## Validation

- `npm run build` in `client/`: passed. Vite reported the existing missing `./.svelte-kit/tsconfig.json` base-config warning and a large-bundle advisory.
- `npm run lint` in `client/`: passed with existing Oxlint warnings; no lint failures.
- From the workspace root, `npm run build` and `npm run lint` both resolve to the client; `npm run dev -- --version` resolves to the local Vite 5.4.21 binary.
- Runtime checks: frontend returned HTTP 200, `/api/health` returned HTTP 200, and `/api/events` returned HTTP 200. A local MongoDB listener is present on port 27017.
- Changed frontend files were checked with the VS Code Problems tool: no errors found.
- Role separation was checked against the route guards, navigation, and action visibility in the UI. No live role-account/browser integration test suite is present in the client package.
