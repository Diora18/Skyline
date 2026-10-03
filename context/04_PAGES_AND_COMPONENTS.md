# Skyline Student Association - Pages and Components

This document details every page and component for the Skyline Student Association React frontend. The application uses React (Vite, JavaScript), React Router DOM v6, Tailwind CSS, and Lucide React icons.

## User Roles & Membership
- **Roles:** student, volunteer, treasurer, officer
- **Membership Status:** none, active, expired

---

## LAYOUT COMPONENTS

### Navbar
- Fixed top, white bg, shadow-sm
- Left: Logo/Brand text "Skyline SSA"
- Center: Nav links (changes based on role):
  - Everyone: Home, Events, Merch, Announcements, Projects
  - Volunteer: + Scanner (links to `/admin/scanner`)
  - Treasurer: + Treasury (links to `/admin/treasury`)
  - Officer: + Admin dropdown (Members, Create Event, Inventory, Orders, Treasury, Scanner)
- Right: 
  - If logged out: Login / Register buttons
  - If logged in: User avatar + name + role badge + dropdown (My Card, My Tickets, My Orders, My Expenses, Logout)
- Mobile: Hamburger menu

### Sidebar (Admin pages only)
- Visible on `/admin/*` routes
- Links: Members, Events, Inventory, Orders, Treasury, Expenses, Announcements, Scanner
- Shown only for officer and treasurer (treasurer sees only Treasury & Expenses)

### Footer
- Simple: "© 2026 Skyline Student Association. Built for Odoo Hackathon."

---

## ALL PAGES

### 1. Home Page (`/`)
- **Route Path:** `/`
- **Access:** Everyone (public)
- **Title:** Home - Skyline Student Association
- **Layout Description:**
  1. **Hero banner:** Club name, tagline "Your campus community, organized.", CTA button "Join Now" (if not member) or "View My Card" (if member).
  2. **Stats row:** 4 cards showing Active Members count, Upcoming Events count, Products in Store count, Club Balance (visible only to treasurer/officer).
  3. **Upcoming Events carousel/row:** Latest 3 published events as cards (links to `/events/:id`).
  4. **Latest Announcements:** Last 3 announcements as small cards (links to `/announcements`).
  5. **Quick Links section:** Join, Events, Store, Announcements.
- **Data Fetched:** GET `/api/members?status=active` count (or stats endpoint), GET `/api/events?status=published&limit=3`, GET `/api/announcements?limit=3`, GET `/api/products?active=true` count, GET `/api/treasury/summary` (for balance, if authorized).
- **Interactions:** Join Now / View My Card buttons. Carousel navigation.
- **Conditional Rendering:** CTA button text based on membership. Stats row conditionally shows Club Balance for treasurer/officer.

### 2. Auth Pages

#### Login (`/login`)
- **Route Path:** `/login`
- **Access:** Unauthenticated users
- **Title:** Login
- **Layout Description:**
  - Clean centered card with Email input, Password input, "Login" button.
  - Link: "Don't have an account? Register"
- **Data Fetched:** POST `/api/auth/login`
- **Interactions:** Form submission, redirect to `/` on success, saving token.

#### Register (`/register`)
- **Route Path:** `/register`
- **Access:** Unauthenticated users
- **Title:** Register
- **Layout Description:**
  - Centered card with: Name, Student ID, Email, Phone, Major dropdown, Graduation Year dropdown, Password, Confirm Password inputs.
  - "Create Account" button.
  - Link: "Already have an account? Login"
- **Data Fetched:** POST `/api/auth/register`
- **Interactions:** Form submission, redirect to `/` on success, saving token.

### 3. Membership Pages

#### Join / Pay Dues (`/membership/join`)
- **Route Path:** `/membership/join`
- **Access:** Logged in, membershipStatus is 'none' or 'expired'
- **Title:** Join / Renew Membership
- **Layout Description:**
  - Card showing: "Become a Skyline Member" / "Renew Your Membership"
  - Benefits list (bullet points): Member event pricing, Digital QR card, Merch store access, Expense submission.
  - Dues amount: $25 / year.
  - "Pay & Join" button.
  - If already active member: shows "You're already an active member!" with link to `/membership/card`.
- **Data Fetched:** POST `/api/members/pay-dues`
- **Interactions:** "Pay & Join" button triggers API, redirects to `/membership/card` on success.
- **Conditional Rendering:** Message and redirect link if user is already an active member.

#### My Membership Card (`/membership/card`)
- **Route Path:** `/membership/card`
- **Access:** Logged in, membershipStatus is 'active' (redirects to `/membership/join` if not)
- **Title:** My Membership Card
- **Layout Description:**
  - Styled digital card (dark gradient bg, white text): "SKYLINE STUDENT ASSOCIATION" header, Member name, Student ID, Major.
  - Membership status badge (green "ACTIVE").
  - Valid from: [date], Valid until: [date].
  - Large QR code at bottom (encodes: JSON with userId, name, studentId, membershipStatus).
  - Below card: "Member since [date]" info.
- **Data Fetched:** None (uses auth user context context).
- **Conditional Rendering:** Redirects if not active.

#### Member Directory (`/admin/members`)
- **Route Path:** `/admin/members`
- **Access:** Officer only
- **Title:** Member Directory
- **Layout Description:**
  - Top bar: Title "Member Directory", search input, status filter dropdown (All/Active/Expired/None), total count badge.
  - Data table with columns: Name | Student ID | Email | Role | Membership Status | Joined | Expires | Actions.
  - Pagination at bottom.
- **Data Fetched:** GET `/api/members?status=...&search=...&page=...&limit=20`
- **Interactions:** 
  - Role dropdown in actions column (calls PATCH `/api/members/:id/role`).
  - "Send Reminder" button for expired members (calls POST `/api/members/:id/send-reminder`).

### 4. Event Pages

#### Events Listing (`/events`)
- **Route Path:** `/events`
- **Access:** Everyone (public)
- **Title:** Upcoming Events
- **Layout Description:**
  - Top: Title "Upcoming Events", filter bar (category dropdown, sort by date), officer sees "+ Create Event" button.
  - Grid of event cards (3 columns desktop, 1 mobile), each showing: Banner image/placeholder, Category badge, Title, Date, Venue, Price, Capacity bar. (If sold out: red "SOLD OUT" overlay).
  - If no events: empty state with illustration and "No upcoming events" message.
- **Data Fetched:** GET `/api/events?status=published`
- **Interactions:** Click card to view details. Officer "+ Create Event" opens modal/page.
- **Conditional Rendering:** "+ Create Event" button for officers. Empty state rendering.

#### Event Detail (`/events/:id`)
- **Route Path:** `/events/:id`
- **Access:** Everyone
- **Title:** Event Details
- **Layout Description:**
  - Large banner image at top.
  - Below: Event title, category badge, status badge.
  - Info grid: Date/Time | Venue/Address | Capacity (X remaining).
  - Description section.
  - Ticket Purchase Section (conditional).
  - Officer sees: "Edit Event" button, "View Attendees" link, "Event Team" section.
  - **Event Team section (officer only):**
    - Shows current event managers with name + role badge + "Remove" button next to each.
    - "**+ Add Manager**" button → dropdown of all members → select → calls `PATCH /api/events/:id/managers` with `action: "add"`.
    - Purpose: Delegates scoped event admin access (edit event, scan tickets, manage linked project tasks) to assigned managers.
  - Attendees section (officer/volunteer/event manager only): Shows checked-in count / total tickets, list of attendee names + check-in status.
- **Data Fetched:** GET `/api/events/:id`, GET `/api/tickets/event/:eventId` (for officers/volunteers/event managers).
- **Interactions:** Buy ticket button, Edit event (modal), RSVP button, Add/Remove event manager.
- **Conditional Rendering:** 
  - Not logged in: "Log in to get tickets" button.
  - Logged in (active): Shows member price, "Get Ticket — $10" button.
  - Logged in (none/expired): Shows non-member price, link to join, "Get Ticket — $15" button.
  - Has ticket: inline ticket component, "View My Ticket" button.
  - Sold out: Disabled button.
  - Free event: "RSVP (Free)" button.
  - Officer: Full edit access, Event Team section, Attendees section.
  - Event manager (user in `managers` array): Edit button, Attendees section (but NOT Event Team management — only officers can assign managers).
  - Volunteer: Attendees section only.

#### Create/Edit Event (Modal on `/events` or separate page)
- **Route Path:** Modal on `/events`
- **Access:** Officer only
- **Title:** Create / Edit Event
- **Layout Description:**
  - Form fields: Title, Description, Category, Banner Image URL, Venue, Address, Start Date & Time, End Date & Time, Ticketing toggle, Capacity, Status, Checkbox: "Create linked volunteer project board".
- **Data Fetched:** POST `/api/events` (create) or PATCH `/api/events/:id` (edit)
- **Conditional Rendering:** If Ticketing toggle is Paid, Member Price and Non-Member Price inputs appear.

#### My Tickets (`/tickets`)
- **Route Path:** `/tickets`
- **Access:** Logged in
- **Title:** My Tickets
- **Layout Description:**
  - Grid/list of user's tickets: Event name, date, venue, Ticket code, Ticket type badge, Price paid, Status badge, QR Code (clickable to expand).
- **Data Fetched:** GET `/api/tickets/my`

#### Door Scanner (`/admin/scanner`)
- **Route Path:** `/admin/scanner`
- **Access:** Volunteer, Officer
- **Title:** Door Check-In Scanner
- **Layout Description:**
  - Top: Title "Door Check-In Scanner". Optional Event selector dropdown.
  - Large camera viewfinder area.
  - Manual entry input + "Verify" button.
  - Scan Result Panel (✅ Green, ⚠️ Yellow, ❌ Red).
  - Live Stats bar: "Checked In: X / Y" progress bar.
  - Recent Scans feed.
- **Data Fetched:** POST `/api/tickets/scan`, GET `/api/tickets/event/:eventId`
- **Interactions:** Scanning QR code, submitting manual entry code.

### 5. Merchandise Pages

#### Merch Store (`/merch`)
- **Route Path:** `/merch`
- **Access:** Everyone (public browsing)
- **Title:** Merch Store
- **Layout Description:**
  - Top: Title "Merch Store", category filter.
  - Product grid: Image, Name, Price, Total stock badge.
- **Data Fetched:** GET `/api/products?active=true`
- **Interactions:** Clicking card opens product detail modal or navigates to `/merch/:id`.
- **Conditional Rendering:** Out of stock cards are greyed out.

#### Product Detail (`/merch/:id` or modal)
- **Route Path:** `/merch/:id`
- **Access:** Everyone can view, only active members can order
- **Title:** Product Details
- **Layout Description:**
  - Product image, Name, description, Price.
  - Size selector, Color selector.
  - Quantity stepper (max = available stock).
  - Total amount.
  - "Order Now" button.
- **Data Fetched:** GET `/api/products/:id`, POST `/api/orders`
- **Interactions:** Selecting variants, quantity, submitting order.
- **Conditional Rendering:** 
  - Not logged in: "Log in to order".
  - Logged in (not active): "Join the club to order".
  - Out-of-stock variants disabled.

#### My Orders (`/orders`)
- **Route Path:** `/orders`
- **Access:** Logged in members
- **Title:** My Orders
- **Layout Description:**
  - List/table of user's orders: Order #, Product Name, Size/Color, Qty, Total, Status (step indicator), Date.
- **Data Fetched:** GET `/api/orders/my`

#### Manage Orders (`/admin/orders`)
- **Route Path:** `/admin/orders`
- **Access:** Officer only
- **Title:** Manage Orders
- **Layout Description:**
  - Filter bar: Status dropdown.
  - Data table of orders.
  - Actions: Status advancement buttons (Confirm, Mark Ready, Mark Collected, Cancel).
- **Data Fetched:** GET `/api/orders`, PATCH `/api/orders/:id/status`

#### Manage Inventory (`/admin/inventory`)
- **Route Path:** `/admin/inventory`
- **Access:** Officer only
- **Title:** Manage Inventory
- **Layout Description:**
  - Top: Title, "+ Add Product" button.
  - Table: Product Name | Category | Variants (expandable) | Total Stock | Total Sold | Active | Actions.
  - Actions: Edit product, Toggle active/inactive.
  - Add Product form/modal.
- **Data Fetched:** GET `/api/products`, POST `/api/products`, PATCH `/api/products/:id`, PATCH `/api/products/:id/stock`

### 6. Project & Task Pages

#### Projects List (`/projects`)
- **Route Path:** `/projects`
- **Access:** Everyone (logged in)
- **Title:** Projects & Fundraisers
- **Layout Description:**
  - Top: Title "Projects & Fundraisers", officer sees "+ Create Project" button.
  - Grid of project cards: Title, Description snippet, Deadline, Linked event, Progress bar, Status badge.
- **Data Fetched:** GET `/api/projects`
- **Interactions:** Click card to view board.
- **Conditional Rendering:** "+ Create Project" button for officers.

#### Project Task Board (`/projects/:id`)
- **Route Path:** `/projects/:id`
- **Access:** Everyone logged in. Volunteers can move their own tasks. Officers have full control.
- **Title:** Project Task Board
- **Layout Description:**
  - Top: Project title, description, deadline, linked event, overall progress bar.
  - Three column Kanban board: To Do, In Progress, Done.
  - Task cards: Title, Assignee, Due date, Priority badge, Supplies list preview.
  - Add/Edit Task modal for officers.
- **Data Fetched:** GET `/api/projects/:id`, POST `/api/tasks`, PATCH `/api/tasks/:id`, DELETE `/api/tasks/:id`
- **Interactions:** Drag-and-drop or status dropdown to move tasks.
- **Conditional Rendering:** Volunteers only move own tasks; Officers move/edit any task, see "+ Add Task".

### 7. Treasury & Expense Pages

#### Treasury Dashboard (`/admin/treasury`)
- **Route Path:** `/admin/treasury`
- **Access:** Treasurer, Officer
- **Title:** Treasury Dashboard
- **Layout Description:**
  - Top row: 3 metric cards (Total Income, Total Expenses, Net Balance).
  - Income Breakdown section (chart).
  - Recent Transactions table.
  - "+ Record Transaction" button and modal.
- **Data Fetched:** GET `/api/treasury/summary`, GET `/api/treasury/transactions`, POST `/api/treasury/transactions`

#### Expense Claims (`/admin/expenses`)
- **Route Path:** `/admin/expenses`
- **Access:** Treasurer, Officer
- **Title:** Expense Claims
- **Layout Description:**
  - Filter bar: Status.
  - Table: Submitted By | Amount | Category | Description | Project | Receipt | Status | Date | Actions.
  - Actions: Approve, Reject, Mark Reimbursed.
- **Data Fetched:** GET `/api/expenses`, PATCH `/api/expenses/:id/review`, PATCH `/api/expenses/:id/reimburse`

#### Submit Expense (`/expenses/submit`)
- **Route Path:** `/expenses/submit`
- **Access:** Volunteer, Treasurer, Officer
- **Title:** Submit Expense Claim
- **Layout Description:**
  - Form: Amount, Category, Description, Linked Project, Receipt upload.
  - Below form: "My Expense Claims" table.
- **Data Fetched:** POST `/api/expenses`, GET `/api/expenses/my`

### 8. Announcements Pages

#### Announcements Board (`/announcements`)
- **Route Path:** `/announcements`
- **Access:** Everyone (public)
- **Title:** Announcements
- **Layout Description:**
  - Top: Title, search input, category filter, officer sees "+ Post Announcement" button.
  - Chronological feed of announcements (Category badge, Title, Body text, "Posted by" footer, emailSent note).
- **Data Fetched:** GET `/api/announcements`
- **Conditional Rendering:** "+ Post Announcement" button for officers.

#### Post Announcement (modal on `/announcements`)
- **Route Path:** Modal on `/announcements`
- **Access:** Officer only
- **Title:** Post Announcement
- **Layout Description:**
  - Form: Title, Body, Category, Checkbox: "Send email notification to all active members".
- **Data Fetched:** POST `/api/announcements`

---

## SHARED / REUSABLE COMPONENTS

1. **Button** — variants: primary, secondary, danger, ghost. Props: `children`, `onClick`, `disabled`, `loading`, `className`
2. **Modal** — centered overlay. Props: `isOpen`, `onClose`, `title`, `children`
3. **Card** — white bg, rounded, shadow. Props: `children`, `className`
4. **Badge / StatusBadge** — pill shape. Props: `status` (maps to color), `text`
5. **Input / Select / Textarea** — styled form elements with label and error state
6. **DataTable** — table with headers, rows, optional pagination. Props: `columns`, `data`, `pagination`
7. **PageHeader** — title, subtitle, optional action button (right side)
8. **EmptyState** — icon, title, description, optional CTA button
9. **LoadingSpinner** — centered spinner for async data loading
10. **Toast/Notification** — success/error toast messages
11. **QRCodeDisplay** — renders QR code. Props: `value` (string to encode), `size`
12. **QRScanner** — camera-based QR scanner. Props: `onScan(result)`, `onError`
13. **KanbanBoard** — three-column layout. Props: `columns`, `tasks`, `onMoveTask`
14. **StepIndicator** — horizontal step progress (for order status). Props: `steps`, `currentStep`
15. **StatCard** — metric display card. Props: `title`, `value`, `icon`, `color`
16. **ConfirmDialog** — "Are you sure?" modal. Props: `isOpen`, `onConfirm`, `onCancel`, `message`

---

## ROUTE CONFIGURATION

```jsx
<Routes>
  {/* Public / Unauthenticated */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/events" element={<EventsListing />} />
  <Route path="/events/:id" element={<EventDetail />} />
  <Route path="/merch" element={<MerchStore />} />
  <Route path="/merch/:id" element={<ProductDetail />} />
  <Route path="/announcements" element={<AnnouncementsBoard />} />

  {/* Authenticated routes */}
  <Route path="/membership/join" element={<JoinMembership />} />
  <Route path="/membership/card" element={<MyMembershipCard />} />
  <Route path="/tickets" element={<MyTickets />} />
  <Route path="/orders" element={<MyOrders />} />
  <Route path="/projects" element={<ProjectsList />} />
  <Route path="/projects/:id" element={<ProjectTaskBoard />} />

  {/* Authorized / Admin routes */}
  <Route path="/admin/scanner" element={<DoorScanner />} />
  <Route path="/admin/members" element={<MemberDirectory />} />
  <Route path="/admin/orders" element={<ManageOrders />} />
  <Route path="/admin/inventory" element={<ManageInventory />} />
  <Route path="/admin/treasury" element={<TreasuryDashboard />} />
  <Route path="/admin/expenses" element={<ExpenseClaims />} />
  <Route path="/expenses/submit" element={<SubmitExpense />} />
</Routes>
```
