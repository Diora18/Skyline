# Project Progress Tracker
## Skyline Student Association Platform

> **Live Roadmap & Status Dashboard**  
> Update this document as tasks are started and completed so the whole team has real-time visibility.

---

## Overall Project Status

| Metric | Count / Status |
| :--- | :--- |
| **Total Work Items** | 68 items |
| **Completed `[x]`** | 30 (Context Docs + Full Backend) |
| **In Progress `[/]`** | 0 |
| **Pending `[ ]`** | 38 (Frontend) |
| **Overall Progress** | **44%** |

---

## Current In-Flight Tasks (Claimed by Team)
*Add your name and what file/feature you are actively building right now so nobody duplicates effort:*

* *Backend complete. Ready to begin frontend scaffolding!*

---

## 1. Project Scaffolding & Environment Setup
- [x] Create project specification & context documentation in `/context`
- [x] Initialize `server/` Node.js environment (`package.json`)
- [x] Install server dependencies (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `express-validator`, `multer`)
- [x] Create `server/.env` with configuration keys
- [x] Create `.gitignore`
- [ ] Initialize `client/` Vite + React project
- [ ] Install client dependencies (`react-router-dom`, `axios`, `lucide-react`, `tailwindcss`, `qrcode.react`, `html5-qrcode`)
- [ ] Configure `client/tailwind.config.js` with Skyline theme colors

---

## 2. Database Models (`server/models/`)
- [x] `User.js` (Roles: student, volunteer, treasurer, officer; Membership: none, active, expired)
- [x] `Event.js` (Multi-tier pricing, capacity, status, `managers` array for scoped delegation)
- [x] `Ticket.js` (ticketCode `TKT-2026-XXXX`, ticketType, price, status, checkedInAt)
- [x] `Product.js` (basePrice, category, embedded variants array with size/color/stock)
- [x] `Order.js` (orderNumber `ORD-2026-XXXX`, variant snapshot, status pipeline)
- [x] `Project.js` (initiative goals, deadline, linkedEvent, status)
- [x] `Task.js` (project ref, assignee ref, status: todo/in_progress/done, priority, supplies list)
- [x] `Transaction.js` (automated ledger: type, category, amount, referenceModel, referenceId)
- [x] `Expense.js` (submittedBy, amount, category, receiptUrl, status, review audit)
- [x] `Announcement.js` (title, body, category, postedBy, emailSent flag)

---

## 3. Backend Core & Infrastructure (`server/`)
- [x] `server/config/db.js` (Mongoose connection with retry & error traps)
- [x] `server/middleware/auth.js` (JWT token extraction & user hydration on `req.user`)
- [x] `server/middleware/roleCheck.js` (Role authorization factory + `canManageEvent` helper)
- [x] `server/utils/generateCode.js` (Collision-resistant `TKT-2026-XXXX` & `ORD-2026-XXXX` generators)
- [x] `server/server.js` (Express app bootstrap, CORS, JSON parsing, error handler, route mounting)
- [x] `server/seed.js` (Full demo database population: 12 users, 4 events, 24 tickets, 5 products, 10 orders, 2 projects, 18 tasks, 17 transactions, 6 expenses, 5 announcements)

---

## 4. API Endpoints & Controllers (`server/controllers/` & `routes/`)
- [x] **Auth:** Register, Login, Me (`/api/auth`)
- [x] **Members:** Directory, Member Detail, Pay Dues, Role Update, Renewal Reminder (`/api/members`)
- [x] **Events:** List, Detail, Create, Update, Delete, Assign Event Managers (`/api/events`)
- [x] **Tickets:** Purchase, My Tickets, Event Attendees, Door Scan Check-In (`/api/tickets`)
- [x] **Products:** List, Detail, Create, Update, Variant Stock Adjustment (`/api/products`)
- [x] **Orders:** Checkout, My Orders, Officer Orders List, Status Pipeline Advance (`/api/orders`)
- [x] **Projects:** List, Detail, Create, Update (`/api/projects`)
- [x] **Tasks:** Create, Update (Drag/Status), Delete (`/api/tasks`)
- [x] **Treasury:** Financial Summary Aggregation, Transaction Ledger, Manual Adjustment (`/api/treasury`)
- [x] **Expenses:** Submit Claim, My Claims, Review Queue, Reimburse & Auto-Ledger (`/api/expenses`)
- [x] **Announcements:** Feed, Publish with Email Broadcast simulation, Delete (`/api/announcements`)

---

## 5. Frontend Foundation & Services (`client/src/`)
- [ ] `services/api.js` (Axios instance with Bearer token interceptor & error unwrapping)
- [ ] `context/AuthContext.jsx` (Global auth state: login, logout, register, role helpers, token persistence)
- [ ] Domain service callers (`authService.js`, `eventService.js`, `ticketService.js`, `treasuryService.js`, etc.)
- [ ] `utils/formatDate.js` & `formatCurrency.js`
- [ ] `utils/constants.js` (Role enums, category lists, status colors)
- [ ] `utils/mockData.js` (Offline fixtures for unblocked UI development)

---

## 6. Reusable UI Components (`client/src/components/`)
- [ ] `layout/Navbar.jsx` (Skyline branding, role-based nav links, user profile pill)
- [ ] `layout/Sidebar.jsx` (Admin & management sidebar with active route highlighters)
- [ ] `layout/Footer.jsx` (Club mission & quick links)
- [ ] `ui/Button.jsx` (Primary, secondary, danger, ghost, loading states)
- [ ] `ui/Modal.jsx` (Accessible dialog with backdrop & ESC listener)
- [ ] `ui/Card.jsx` & `ui/Badge.jsx`
- [ ] `ui/Input.jsx`, `Select.jsx`, `Textarea.jsx`
- [ ] `shared/QRCodeDisplay.jsx` (Dynamic QR generation with download option)
- [ ] `shared/QRScanner.jsx` (Live camera feed QR scanning via `html5-qrcode`)
- [ ] `shared/KanbanBoard.jsx` (3-column layout: To Do, In Progress, Done)
- [ ] `shared/StatusBadge.jsx` & `RoleBadge.jsx`
- [ ] `shared/StatCard.jsx` & `DataTable.jsx`

---

## 7. Frontend Pages (`client/src/pages/`)
- [ ] **Home Page (`/`):** Hero, quick stats, upcoming events carousel, latest notices
- [ ] **Auth Pages:** Login (`/login`) & Register (`/register`)
- [ ] **Membership:** Join / Pay Dues (`/membership/join`) & Digital Member QR Card (`/membership/card`)
- [ ] **Member Directory (`/admin/members`):** Search, filters, role promotion, reminder buttons
- [ ] **Events Feed (`/events`):** Card grid, category filters, sold-out overlays, "+ Create Event" button
- [ ] **Event Detail (`/events/:id`):** Full info, dynamic member/non-member pricing, buy button, Event Team manager assignment
- [ ] **My Tickets (`/tickets`):** User's ticket wallet with scannable QR codes
- [ ] **Door Scanner (`/admin/scanner`):** Camera scanner with instant green/yellow/red feedback & manual fallback
- [ ] **Merch Store (`/merch`):** Product catalog, size/variant selector, live stock counters
- [ ] **Orders:** My Orders (`/orders`) & Order Fulfillment Dashboard (`/admin/orders`)
- [ ] **Inventory (`/admin/inventory`):** Stock adjustment table & "+ Add Product" modal
- [ ] **Volunteer Projects (`/projects` & `/projects/:id`):** Initiative list & interactive Kanban task board
- [ ] **Treasury Dashboard (`/admin/treasury`):** Income/Expense/Net balance cards, transaction ledger, manual entry
- [ ] **Expenses:** Submit Claim (`/expenses/submit`) & Review Queue (`/admin/expenses`)
- [ ] **Announcements (`/announcements`):** Filterable public bulletin & officer publishing modal

---

## 8. Integration, Testing & Demo Polish
- [x] Run `seed.js` and verify end-to-end data integrity in MongoDB
- [x] Test membership join → member pricing immediately applies on events
- [x] Test ticket purchase → instant QR code generation → scan via camera scanner
- [ ] Test merch ordering → inventory stock decrements in real-time
- [ ] Test expense reimbursement → treasury net cash balance updates automatically
- [ ] Rehearse 5-minute hackathon judge presentation script
