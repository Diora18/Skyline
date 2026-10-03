# Project Progress Tracker
## Skyline Student Association Platform

> **Live Roadmap & Status Dashboard**  
> Update this document as tasks are started and completed so the whole team has real-time visibility.

---

## Overall Project Status

| Metric | Count / Status |
| :--- | :--- |
| **Total Work Items** | 68 items |
| **Completed `[x]`** | 5 (Specification & Context Docs) |
| **In Progress `[/]`** | 0 |
| **Pending `[ ]`** | 63 |
| **Overall Progress** | **8%** |

---

## Current In-Flight Tasks (Claimed by Team)
*Add your name and what file/feature you are actively building right now so nobody duplicates effort:*

* *No tasks currently claimed. Ready to begin scaffolding!*

---

## 1. Project Scaffolding & Environment Setup
- [x] Create project specification & context documentation in `/context`
- [ ] Initialize `server/` Node.js environment (`npm init -y`)
- [ ] Install server dependencies (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `express-validator`, `multer`)
- [ ] Create `server/.env` with configuration keys
- [ ] Initialize `client/` Vite + React project
- [ ] Install client dependencies (`react-router-dom`, `axios`, `lucide-react`, `tailwindcss`, `qrcode.react`, `html5-qrcode`)
- [ ] Configure `client/tailwind.config.js` with Skyline theme colors

---

## 2. Database Models (`server/models/`)
- [ ] `User.js` (Roles: student, volunteer, treasurer, officer; Membership: none, active, expired)
- [ ] `Event.js` (Multi-tier pricing, capacity, status, `managers` array for scoped delegation)
- [ ] `Ticket.js` (ticketCode `TKT-2026-XXXX`, ticketType, price, status, checkedInAt)
- [ ] `Product.js` (basePrice, category, embedded variants array with size/color/stock)
- [ ] `Order.js` (orderNumber `ORD-2026-XXXX`, variant snapshot, status pipeline)
- [ ] `Project.js` (initiative goals, deadline, linkedEvent, status)
- [ ] `Task.js` (project ref, assignee ref, status: todo/in_progress/done, priority, supplies list)
- [ ] `Transaction.js` (automated ledger: type, category, amount, referenceModel, referenceId)
- [ ] `Expense.js` (submittedBy, amount, category, receiptUrl, status, review audit)
- [ ] `Announcement.js` (title, body, category, postedBy, emailSent flag)

---

## 3. Backend Core & Infrastructure (`server/`)
- [ ] `server/config/db.js` (Mongoose connection with retry & error traps)
- [ ] `server/middleware/auth.js` (JWT token extraction & user hydration on `req.user`)
- [ ] `server/middleware/roleCheck.js` (Role authorization factory)
- [ ] `server/utils/generateCode.js` (Collision-resistant `TKT-2026-XXXX` & `ORD-2026-XXXX` generators)
- [ ] `server/server.js` (Express app bootstrap, CORS, JSON parsing, error handler, route mounting)
- [ ] `server/seed.js` (Full demo database population script: 12 users, 4 events, 24 tickets, merch, tasks, transactions)

---

## 4. API Endpoints & Controllers (`server/controllers/` & `routes/`)
- [ ] **Auth:** Register, Login, Me (`/api/auth`)
- [ ] **Members:** Directory, Member Detail, Pay Dues, Role Update, Renewal Reminder (`/api/members`)
- [ ] **Events:** List, Detail, Create, Update, Delete, Assign Event Managers (`/api/events`)
- [ ] **Tickets:** Purchase, My Tickets, Event Attendees, Door Scan Check-In (`/api/tickets`)
- [ ] **Products:** List, Detail, Create, Update, Variant Stock Adjustment (`/api/products`)
- [ ] **Orders:** Checkout, My Orders, Officer Orders List, Status Pipeline Advance (`/api/orders`)
- [ ] **Projects:** List, Detail, Create, Update (`/api/projects`)
- [ ] **Tasks:** Create, Update (Drag/Status), Delete (`/api/tasks`)
- [ ] **Treasury:** Financial Summary Aggregation, Transaction Ledger, Manual Adjustment (`/api/treasury`)
- [ ] **Expenses:** Submit Claim, My Claims, Review Queue, Reimburse & Auto-Ledger (`/api/expenses`)
- [ ] **Announcements:** Feed, Publish with Email Broadcast simulation, Delete (`/api/announcements`)

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
- [ ] Run `seed.js` and verify end-to-end data integrity in MongoDB
- [ ] Test membership join → member pricing immediately applies on events
- [ ] Test ticket purchase → instant QR code generation → scan via camera scanner
- [ ] Test merch ordering → inventory stock decrements in real-time
- [ ] Test expense reimbursement → treasury net cash balance updates automatically
- [ ] Rehearse 5-minute hackathon judge presentation script
