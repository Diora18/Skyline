# Skyline SSA — Role and User Workflows

**Audit basis:** the running React route tree in `client/src/App.jsx`, navigation and auth state in `client/src/components/club/site-header.tsx` and `client/src/context/AuthContext.jsx`, and the mounted Express routes/controllers in `server/`. The workflow descriptions below reflect the implementation, not the older aspirational page inventory in `context/04_PAGES_AND_COMPONENTS.md`.

## 1. Identity, roles, and membership are separate

There are four global account roles: `student`, `volunteer`, `treasurer`, and `officer`. The API creates new accounts as `student`. `membershipStatus` is a separate value (`none`, `active`, or `expired`): paying dues changes membership status, not the account role. A member can therefore be, for example, an active student or an expired volunteer.

Two event-scoped concepts are not extra global roles:

- **Event manager:** a user who created an event or is listed in that event's `managers` array. Their event-management access does not make them an officer.
- **Event volunteer:** a signed-in user with a volunteer application for one particular event. Application state belongs to the event/user pair and never changes the user's global role.

An event volunteer's supported application states are `pending`, `approved`, `rejected`, and `completed`. A rejected user can apply again; approval for one event does not authorize another event.

## 2. At-a-glance access matrix

| Capability | Visitor | Student | Volunteer | Treasurer | Officer | Event manager | Approved event volunteer |
|---|---|---|---|---|---|---|---|
| Browse home, events, merchandise, bulletin, perks, team, FAQ | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Sign in / register | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Buy an event ticket | Sign-in required | Yes; member price only when active | Yes | Yes | Yes | Yes | Yes |
| Apply to volunteer for a published future event | Sign-in required | Yes | Yes | Yes | Yes | Yes | Yes |
| View own tickets, orders, claims, volunteering history | No | Signed-in only | Signed-in only | Signed-in only | Signed-in only | Signed-in only | Signed-in only |
| Place a merchandise order | No | Active membership required | Active membership required | Active membership required | Active membership required | Active membership required | Active membership required |
| Edit event and review volunteer applications | No | No | No | No | All events | Assigned/created event only | No |
| View event attendees | No | No | All events | API allows event lists; no scanner UI | All events | Assigned/created event only | Assigned event only |
| Scan tickets | No | Only for an approved event-volunteer assignment | Global volunteer access | Not available through the current scanner UI/API scan action | Global officer access | Assigned/created event only | Assigned event only |
| Submit expense claim | No | Only from an approved/completed event assignment | Yes | Yes | Yes | Only for the managed event | Only for the approved/completed event |
| Review/reimburse claims and see Treasury | No | No | No | Yes | Yes | No, unless also Treasurer/Officer | No, unless also Treasurer/Officer |
| Create project task | No | No | No | No | Any project | Project linked to managed event; assigned user must have global Volunteer role | No, unless also manager |
| Manage member roles, orders queue, products, projects, announcements | No | No | No | No | Yes | No | No |
| Change task status in current UI | No | No action for this role | Own assigned task (mark complete) | No action for this role | Any task | No action from manager status alone | No action from event approval alone |

These permissions come from server route guards/controllers as well as the client. Hiding a link is not the authorization boundary; protected API requests remain authoritative.

## 3. Visitor and account onboarding

1. A visitor can use the public pages and open the membership information.
2. To save tickets, apply to volunteer, access projects, view personal history, or activate membership, register or sign in.
3. Registration submits to `POST /api/auth/register`; login submits to `POST /api/auth/login`. The API returns a JWT and user; the client stores the token and loads the current account from `GET /api/auth/me` on a later app start.
4. A new account has the `student` role and `none` membership status. An officer changes global roles through the Member Directory; self-registration does not grant elevated roles.
5. On `/membership/join`, an active member sees their current state. A signed-in non-active user can use the existing dues action. In this demo, dues are simulated: the API activates one year of membership immediately and records a $25 dues transaction; this is not a card processor or a separate membership-application review.

## 4. Student and member workflows

### Events and tickets

1. Browse `/events` and open an event card to see its details in the event modal. The current app does not implement a separate `/events/:id` page.
2. A signed-in user can request a ticket. The API checks that the event is published, that capacity remains, and that the user does not already have a valid/used ticket. It chooses the member/non-member price from current membership status and records ticket income when the price is positive.
3. View ticket codes and QR passes at `/tickets`. Door staff scan a ticket once; a used, cancelled, missing, or wrong-event ticket is not accepted.

### Event-specific volunteering

1. Open an upcoming published event and choose **Apply as Volunteer**. This creates an application for that event only; a second active application for the same event is rejected. A rejected application may be submitted again.
2. Track records at `/volunteering`. The event application state is shown separately for each event.
3. An officer, event creator, or manager for that event reviews the application's pending state and may approve or reject it, and may set a responsibility (up to 120 characters) for approved/completed records.
4. After the event end time, an event manager may mark an approved assignment `completed`. Completion is a manager-confirmed service record; it is not derived from ticket scans.
5. An approved assignment exposes event-scoped scanner and expense links. The API independently checks the event/application on attendee-list reads, ticket scans, and event-linked expense submissions. A URL containing an event ID alone grants no access.
6. Submit claims from the matching assignment. Approved and completed assignments may submit; the claim is directly linked to that event. A claim remains subject to Treasurer/Officer review.

### Membership, merch, projects, and personal records

- Active membership is required by the order API to place a merchandise order. Choose an available size and, when the variant has one, color; the API validates stock, decrements the variant, creates the order, and records merchandise income. Track the user's own orders at `/orders`.
- `/projects` is available to signed-in users. The current client filters non-officer project cards and task cards to projects/tasks assigned to the signed-in account, except that a manager of a project's linked event can open that project to create event tasks. Volunteer-role users can mark their own task complete in the UI; Officers can move any task and manage projects. The API currently returns all tasks to authenticated users, so this client filter is not a data-security boundary.
- `/expenses/my` and `/expenses/submit` support personal claims according to the role/assignment rules above.

## 5. Global Volunteer workflow

1. A Volunteer is a global account role assigned by an officer; it is different from an event application.
2. The Workspace menu exposes the global scanner and expense submission.
3. The Volunteer can load event attendee lists and scan tickets across events. The server still checks the ticket's event and rejects invalid or previously used tickets.
4. The Volunteer can submit a general expense claim, or submit an event-linked claim when authorized for that event. Claims appear in their own history; Treasurer/Officer staff handle the review and reimbursement.
5. The API permits assigned users to update their task status. In the current UI, the Volunteer role gets a "mark complete" control for assigned tasks; Officers can move any task. Task assignment itself is offered in the Officer project-task UI.

## 6. Treasurer workflow

1. Open **Treasury** for totals, ledger transactions, and manual transaction entry.
2. Open **Claims** to review submitted expenses. Approve or reject claims; approved claims can be marked reimbursed, which creates the expense ledger outflow.
3. Treasurer can submit their own expense claims and see their personal history, in addition to the review queue.
4. Treasurer does not have the Officer's member, event-creation, inventory, order-queue, or project-management permissions.

**Observed scanner mismatch:** Treasury routes are available, but the client does not grant Treasurers global scanner access. The attendee-list endpoint currently admits Treasurers, while the scan endpoint does not; do not treat this partial API permission as a complete Treasurer scanning workflow.

## 7. Officer workflow

1. Use the Member Directory to search accounts, update a user's role among the four defined roles, and simulate a renewal reminder.
2. Create, edit, and delete events. Add/remove event managers from an event. An event manager may edit only their event; manager assignment remains Officer-only.
3. Review event volunteer applications for events the Officer can manage. Approve/reject pending applications, set responsibilities, and mark approved applications completed only after the event ends.
4. Manage the global project list, create/update projects, assign tasks, and edit/delete tasks. Officers can see all tasks on project boards.
5. Manage products/stock and the order queue, including order status updates.
6. Create/delete announcements; public visitors can read the announcement board.
7. Access Treasury and the expense review queue. Event-specific claims and paid ticket/merch/dues transactions appear in the ledger according to their API workflows.

## 8. Event manager and event volunteer authority

An **event manager** is an event's creator or a user in that event's manager list. Managers can view and edit the assigned event, review its volunteer applications, and access that event's attendees/scanner. They cannot create events, assign managers, access the Member Directory or Treasury, or manage other events merely because of this assignment.

An **approved event volunteer** is different: approval grants the attendee list, scanning, and event-linked claim submission for that one event. It does not grant event editing, application-review controls, a global scanner role, or Treasury access. `pending` and `rejected` applications grant none of those operational rights; `completed` remains visible as history and is accepted for event-linked claims.

## 9. Current route map

| Route | Access enforced by current frontend |
|---|---|
| `/`, `/event`, `/events`, `/merch`, `/announcements`, `/perks`, `/team`, `/faq` | Public |
| `/login`, `/register` | Public |
| `/membership/join` | Page is public; activating membership requires a signed-in account |
| `/projects`, `/projects/:id`, `/tickets`, `/volunteering`, `/orders`, `/expenses/my` | Signed in |
| `/expenses/submit` | Signed in; global Volunteer/Treasurer/Officer or event context for backend assignment validation |
| `/admin/scanner` | Signed in; global Volunteer/Officer/event manager or event context for backend assignment validation |
| `/scanner` | Signed in; global scanner permission (Volunteer, Officer, or event manager) |
| `/admin/treasury`, `/admin/expenses` | Treasurer or Officer |
| `/admin/orders`, `/admin/members`, `/admin/inventory` | Officer |
| `*` | Not found |

The `eventId` query parameter is only context for the frontend. The API validates that the signed-in user is authorized for that specific event.

## 10. Audit findings and documentation boundaries

The earlier `context/04_PAGES_AND_COMPONENTS.md` is a design inventory, not an exact description of the current routes. In particular, it describes a membership-card route, a dedicated event-detail route, and a role sidebar that are not present in `App.jsx`. Current event details are a modal; the actual role-aware navigation is the header's Workspace menu. This file and `App.jsx` should be checked before treating older page inventory entries as implemented.

The following implementation gaps were observed during this audit and are intentionally recorded rather than disguised as working flows:

1. **Project task read scope:** the project detail API returns every task on the project to any authenticated user. The UI filters non-officer project/task cards to assignments for the current user, but this is a client-side filter, not an API data restriction. Project list metadata is visible to all signed-in users. Do not use the UI filter as a confidentiality boundary.
2. **Project task create/update scope:** the task-create API permits Officers to create project tasks and permits event managers to create tasks only in a project linked to their event; managers must assign a global Volunteer. The task-update API permits any assigned account to change status, while the current UI offers the completion control only to global Volunteers and Officers. Event-manager authority alone does not grant task editing.
3. **Treasurer scanner:** as noted above, attendee-list and scan authorization differ, and the current frontend does not offer a Treasurer scanner workflow.
4. **Membership payment:** the existing dues action is a demo activation/ledger operation, not an integrated payment gateway.
5. **Workflow UI coverage:** there is no global application screen for reviewing every event; application review is reached in event management. There is no standalone member QR-card route in the current router.

These findings should be resolved in code/API authorization before claiming stronger data isolation or permissions. No undocumented roles, membership states, event-application states, or backend endpoints are implied by this guide.
