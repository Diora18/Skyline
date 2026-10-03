# Skyline Student Association - Database Schemas

This document serves as the single source of truth for the Mongoose database schemas in the Skyline Student Association platform. It contains exhaustive definitions, exact Mongoose syntax, field references, relationships, business rules, and indexing recommendations to ensure consistency across the development team.

---

## Entity Relationship Overview

```text
[User] 
  ↑ (createdBy) -------- [Event]
  ↑ (user) ------------- [Ticket] → (event) → [Event]
  ↑ (user) ------------- [Order] → (product) → [Product]
  ↑ (createdBy) -------- [Project] ← (linkedProject) ← [Event]
  ↑ (assignee) --------- [Task] → (project) → [Project]
  ↑ (submittedBy/reviewedBy) [Expense] → (linkedProject) → [Project]
  ↑ (postedBy) --------- [Announcement]
  ↑ (createdBy) -------- [Transaction]

[Transaction] 
  ↓ (referenceId/referenceModel: Polymorphic)
  [User | Ticket | Order | Expense]
```

---

## 1. User

### Schema
```js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },  // hashed, excluded from queries by default
  phone: { type: String, default: '' },
  studentId: { type: String, required: true, unique: true, trim: true },  // university roll number
  major: { type: String, default: '' },
  graduationYear: { type: Number },
  profileImage: { type: String, default: '' },
  role: { type: String, enum: ['student', 'volunteer', 'treasurer', 'officer'], default: 'student' },
  membershipStatus: { type: String, enum: ['none', 'active', 'expired'], default: 'none' },
  membershipPaidAt: { type: Date, default: null },
  membershipExpiresAt: { type: Date, default: null },
}, { timestamps: true });
```

### Field Reference Table
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| name | String | Yes | - | Full name of the user. |
| email | String | Yes | - | Unique email address (lowercased). |
| password | String | Yes | - | Hashed password. Excluded from queries (`select: false`). |
| phone | String | No | '' | Contact phone number. |
| studentId | String | Yes | - | University roll number, must be unique. |
| major | String | No | '' | Field of study. |
| graduationYear | Number | No | - | Expected year of graduation. |
| profileImage | String | No | '' | URL or path to user's profile image. |
| role | String | No | 'student' | Role for RBAC: `student`, `volunteer`, `treasurer`, `officer`. |
| membershipStatus | String | No | 'none' | Current membership state: `none`, `active`, `expired`. |
| membershipPaidAt | Date | No | null | Timestamp of when membership dues were last paid. |
| membershipExpiresAt | Date | No | null | Timestamp of when membership expires (1 year from paid). |

### Relationships
* **Referenced By:** `Event.createdBy`, `Ticket.user`, `Order.user`, `Project.createdBy`, `Task.assignee`, `Transaction.createdBy`, `Expense.submittedBy`, `Expense.reviewedBy`, `Announcement.postedBy`.
* **Polymorphic Reference:** Target of `Transaction` where `referenceModel` is `User` (e.g., membership dues payment).

### Business Rules
* `password` must be explicitly selected (`.select('+password')`) for login verification.
* `membershipExpiresAt` is automatically set to exactly 1 year from `membershipPaidAt` when dues are paid.
* `membershipStatus` should be checked/updated upon login or via a scheduled cron job (or manually during specific events).

### Indexes
* `email` (Unique)
* `studentId` (Unique)
* `role` (For role-based filtering)
* `membershipStatus` (For active member queries)

---

## 2. Event

### Schema
```js
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['gala', 'fundraiser', 'meeting', 'workshop', 'social'], required: true },
  bannerImage: { type: String, default: '' },
  venue: { type: String, required: true },
  address: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  memberPrice: { type: Number, default: 0 },     // 0 = free for members
  nonMemberPrice: { type: Number, default: 0 },   // 0 = free for non-members
  capacity: { type: Number, default: null },       // null = unlimited
  ticketsSold: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published', 'cancelled', 'completed'], default: 'draft' },
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // per-event managers with scoped admin access
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  linkedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
}, { timestamps: true });
```

### Field Reference Table
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| title | String | Yes | - | Event title. |
| description | String | No | '' | Detailed description. |
| category | String | Yes | - | `gala`, `fundraiser`, `meeting`, `workshop`, `social`. |
| bannerImage | String | No | '' | URL/path to event banner. |
| venue | String | Yes | - | Name of the venue. |
| address | String | No | '' | Physical address of the venue. |
| startDate | Date | Yes | - | Start time of the event. |
| endDate | Date | Yes | - | End time of the event. |
| memberPrice | Number | No | 0 | Price for active members. 0 = free. |
| nonMemberPrice | Number | No | 0 | Price for non-members. 0 = free. |
| capacity | Number | No | null | Maximum attendees. `null` means unlimited. |
| ticketsSold | Number | No | 0 | Counter of valid tickets sold. |
| status | String | No | 'draft' | `draft`, `published`, `cancelled`, `completed`. |
| managers | [ObjectId] | No | [] | Array of `User` IDs with scoped event manager permissions. |
| createdBy | ObjectId | Yes | - | `User` who created the event. |
| linkedProject | ObjectId | No | null | Optional `Project` tied to this event planning. |

### Relationships
* **References:** `User` (`createdBy`, `managers[]`), `Project` (`linkedProject`).
* **Referenced By:** `Ticket.event`, `Project.linkedEvent`.

### Business Rules
* If both `memberPrice` and `nonMemberPrice` are `0`, the event is considered free (RSVP only).
* `ticketsSold` is incremented upon successful ticket creation and decremented upon cancellation.
* The event is considered "sold out" when `ticketsSold >= capacity` (if `capacity` is not `null`).
* **Event Managers** are per-event scoped admins. A user listed in `managers` can:
  * Edit this event's details (title, venue, capacity, pricing, status)
  * View attendee list and ticket stats for this event
  * Use the door QR scanner for this event
  * Manage the linked project's tasks (create, edit, assign, delete tasks)
* Event managers **cannot**: create new events, access other events' data, access member directory, treasury, merch inventory, or post announcements.
* Officers assign managers via `PATCH /api/events/:id/managers`.
* The `createdBy` user implicitly has manager-level access even if not in the `managers` array.

### Indexes
* `startDate` (For chronological querying/sorting)
* `status` (For filtering active events)
* `category`

---

## 3. Ticket

### Schema
```js
const ticketSchema = new mongoose.Schema({
  ticketCode: { type: String, required: true, unique: true },  // e.g., 'TKT-2026-0042'
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketType: { type: String, enum: ['member', 'non-member'], required: true },
  price: { type: Number, required: true },  // actual price paid at time of purchase
  status: { type: String, enum: ['valid', 'used', 'cancelled'], default: 'valid' },
  checkedInAt: { type: Date, default: null },  // set when scanned at door
}, { timestamps: true });
```

### Field Reference Table
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| ticketCode | String | Yes | - | Unique identifier, e.g., 'TKT-2026-0042'. |
| event | ObjectId | Yes | - | Target `Event`. |
| user | ObjectId | Yes | - | Target `User` holding the ticket. |
| ticketType | String | Yes | - | Snapshot of membership state: `member` or `non-member`. |
| price | Number | Yes | - | Exact amount paid for financial records. |
| status | String | No | 'valid' | `valid`, `used`, `cancelled`. |
| checkedInAt | Date | No | null | Timestamp when scanned at the door. |

### Relationships
* **References:** `Event` (`event`), `User` (`user`).
* **Polymorphic Reference:** Target of `Transaction` (income for ticket sale).

### Business Rules
* `ticketCode` format must be: `TKT-<YYYY>-<4-digit-sequence>`.
* `ticketType` and `price` are determined snapshot-style at purchase time based on `User.membershipStatus`.
* `checkedInAt` is populated immediately when a door scanner updates `status` to `used`.

### Indexes
* `ticketCode` (Unique)
* `event` + `user` (Compound, useful for preventing double-booking)
* `status`

---

## 4. Product

### Schema
```js
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  basePrice: { type: Number, required: true },
  category: { type: String, enum: ['hoodie', 'tshirt', 'cap', 'sticker', 'other'], required: true },
  variants: [{
    size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE_SIZE'], required: true },
    color: { type: String, default: 'Default' },
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0 },
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
```

### Field Reference Table
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| name | String | Yes | - | Product name. |
| description | String | No | '' | Product details. |
| image | String | No | '' | Main image URL. |
| basePrice | Number | Yes | - | Cost per unit. |
| category | String | Yes | - | `hoodie`, `tshirt`, `cap`, `sticker`, `other`. |
| variants | Array | Yes | - | Embedded documents for sizes/colors/stock. |
| isActive | Boolean | No | true | Soft delete/hide flag. |

#### Variants Array Fields
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| size | String | Yes | - | `XS`, `S`, `M`, `L`, `XL`, `XXL`, `ONE_SIZE`. |
| color | String | No | 'Default' | Color variant. |
| stock | Number | No | 0 | Current available inventory (min 0). |
| sold | Number | No | 0 | All-time sales counter for this variant. |

### Relationships
* **Referenced By:** `Order.product`.

### Business Rules
* Stock management is done within the embedded `variants` array.
* When an `Order` is placed, `stock` is decremented and `sold` is incremented.
* Setting `isActive` to `false` removes it from storefronts without losing historical order data.
* Items without traditional sizing (e.g., stickers) must use `ONE_SIZE`.

### Indexes
* `isActive`
* `category`

---

## 5. Order

### Schema
```js
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },  // e.g., 'ORD-2026-0015'
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: {
    size: { type: String, required: true },
    color: { type: String, default: 'Default' },
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  totalPrice: { type: Number, required: true },  // basePrice * quantity
  status: { type: String, enum: ['placed', 'confirmed', 'ready', 'collected', 'cancelled'], default: 'placed' },
}, { timestamps: true });
```

### Field Reference Table
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| orderNumber | String | Yes | - | Unique order ID, e.g., 'ORD-2026-0015'. |
| user | ObjectId | Yes | - | Target `User` making purchase. |
| product | ObjectId | Yes | - | Target `Product`. |
| variant | Object | Yes | - | Snapshot of purchased variant size/color. |
| quantity | Number | Yes | 1 | Number of items purchased (min 1). |
| totalPrice | Number | Yes | - | `basePrice * quantity`. |
| status | String | No | 'placed' | `placed`, `confirmed`, `ready`, `collected`, `cancelled`. |

### Relationships
* **References:** `User` (`user`), `Product` (`product`).
* **Polymorphic Reference:** Target of `Transaction` (income for merch sale).

### Business Rules
* `orderNumber` format must be: `ORD-<YYYY>-<4-digit-sequence>`.
* `variant` stores a snapshot to protect historical data if product options change.
* Order lifecycle: `placed` → `confirmed` → `ready` (awaiting pickup) → `collected`.

### Indexes
* `orderNumber` (Unique)
* `user` (For user order history)
* `status` (For fulfillment dashboards)

---

## 6. Project

### Schema
```js
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  deadline: { type: Date },
  linkedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
```

### Field Reference Table
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| title | String | Yes | - | Project name. |
| description | String | No | '' | Project goals. |
| deadline | Date | No | - | Completion target date. |
| linkedEvent | ObjectId | No | null | Optional `Event` resulting from this project. |
| status | String | No | 'active' | `active`, `completed`, `archived`. |
| createdBy | ObjectId | Yes | - | Target `User` (officer/lead) who created it. |

### Relationships
* **References:** `Event` (`linkedEvent`), `User` (`createdBy`).
* **Referenced By:** `Event.linkedProject`, `Task.project`, `Expense.linkedProject`.

### Business Rules
* Acts as an umbrella for organizing Tasks and tracking Expenses.

### Indexes
* `status`
* `createdBy`

---

## 7. Task

### Schema
```js
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date, default: null },
  supplies: [{ type: String }],  // checklist items like 'Flour 2kg', 'Butter 500g'
}, { timestamps: true });
```

### Field Reference Table
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| title | String | Yes | - | Task title. |
| description | String | No | '' | Specifics of the work. |
| project | ObjectId | Yes | - | Target `Project`. |
| assignee | ObjectId | No | null | Target `User` assigned. |
| status | String | No | 'todo' | Kanban states: `todo`, `in_progress`, `done`. |
| priority | String | No | 'medium' | `low`, `medium`, `high`. |
| dueDate | Date | No | null | Task deadline. |
| supplies | Array(String) | No | [] | Checklist strings (e.g. 'Flour 2kg'). |

### Relationships
* **References:** `Project` (`project`), `User` (`assignee`).

### Business Rules
* `supplies` is a simple string array for quick lists, distinct from formal `Expenses`.

### Indexes
* `project` (For fetching kanban boards)
* `assignee` (For "My Tasks" views)
* `status`

---

## 8. Transaction

### Schema
```js
const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, enum: ['dues', 'ticket_sale', 'merch_sale', 'reimbursement', 'other'], required: true },
  amount: { type: Number, required: true },  // always positive, type determines +/-
  description: { type: String, required: true },
  referenceModel: { type: String, enum: ['User', 'Ticket', 'Order', 'Expense', null], default: null },
  referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
```

### Field Reference Table
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| type | String | Yes | - | Direction of cash flow: `income`, `expense`. |
| category | String | Yes | - | `dues`, `ticket_sale`, `merch_sale`, `reimbursement`, `other`. |
| amount | Number | Yes | - | Financial value. ALWAYS positive. |
| description | String | Yes | - | Reason for transaction. |
| referenceModel | String | No | null | Polymorphic link: `User`, `Ticket`, `Order`, `Expense`, or `null`. |
| referenceId | ObjectId | No | null | The `_id` of the document matching `referenceModel`. |
| createdBy | ObjectId | No | - | `User` or system context that caused this. |

### Relationships
* **References:** Polymorphic reference to `User`, `Ticket`, `Order`, `Expense` (via `referenceId` + `referenceModel`). `User` (`createdBy`).

### Business Rules
* **AUTO-GENERATED**: The backend creates these automatically.
  * Membership dues paid → `type: income`, `category: dues`, `referenceModel: User`.
  * Ticket purchased → `type: income`, `category: ticket_sale`, `referenceModel: Ticket`.
  * Order placed → `type: income`, `category: merch_sale`, `referenceModel: Order`.
  * Expense status to 'reimbursed' → `type: expense`, `category: reimbursement`, `referenceModel: Expense`.
* `amount` is ALWAYS stored as an absolute (positive) number. The `type` field dictates if it adds to or subtracts from treasury totals.
* Used to power the Treasury Dashboard.

### Indexes
* `type` + `category` (For financial aggregation)
* `createdAt` (For time-based financial reporting)
* `referenceId` + `referenceModel` (Compound)

---

## 9. Expense

### Schema
```js
const expenseSchema = new mongoose.Schema({
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['supplies', 'food', 'decorations', 'transport', 'venue', 'other'], required: true },
  description: { type: String, required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  linkedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  receiptUrl: { type: String, default: '' },  // URL or file path to uploaded receipt image
  status: { type: String, enum: ['submitted', 'approved', 'rejected', 'reimbursed'], default: 'submitted' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' },
}, { timestamps: true });
```

### Field Reference Table
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| submittedBy | ObjectId | Yes | - | Target `User` submitting claim. |
| amount | Number | Yes | - | Out of pocket cost (min 0). |
| category | String | Yes | - | `supplies`, `food`, `decorations`, `transport`, `venue`, `other`. |
| description | String | Yes | - | Detailed description of purchase. |
| event | ObjectId | No | null | Optional `Event` associated with an event-specific volunteer expense claim. |
| linkedProject | ObjectId | No | null | Optional `Project` this relates to. |
| receiptUrl | String | No | '' | S3 URL or path to receipt image. |
| status | String | No | 'submitted' | `submitted`, `approved`, `rejected`, `reimbursed`. |
| reviewedBy | ObjectId | No | null | Target `User` (treasurer) handling claim. |
| reviewedAt | Date | No | null | Timestamp of approval/rejection. |
| rejectionReason | String | No | '' | Reason provided if `rejected`. |

### Relationships
* **References:** `User` (`submittedBy`, `reviewedBy`), `Event` (`event`), `Project` (`linkedProject`).
* **Polymorphic Reference:** Target of `Transaction` (expense reimbursement).

### Business Rules
* Workflow Pipeline: `submitted` → `approved` → `reimbursed` OR `submitted` → `rejected`.
* Reaching `reimbursed` status automatically triggers the creation of a `Transaction` (Expense).
* `rejectionReason` is required from the reviewing officer if changing status to `rejected`.

### Indexes
* `status` (For treasury queue)
* `submittedBy` (For user expense history)

---

## 10. Announcement

### Schema
```js
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  category: { type: String, enum: ['meeting', 'deadline', 'update', 'urgent'], required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emailSent: { type: Boolean, default: false },  // whether email blast was triggered
}, { timestamps: true });
```

### Field Reference Table
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| title | String | Yes | - | Announcement title. |
| body | String | Yes | - | Markdown or HTML body. |
| category | String | Yes | - | `meeting`, `deadline`, `update`, `urgent`. |
| postedBy | ObjectId | Yes | - | Target `User` (officer) who posted. |
| emailSent | Boolean | No | false | Tracks if email notification blast was executed. |

### Relationships
* **References:** `User` (`postedBy`).

### Business Rules
* Used for platform-wide alerts and mass-email triggering.
* `emailSent` acts as a lock/flag to prevent duplicate mass emails.

### Indexes
* `createdAt` (Sort descending for feed)
* `category`
