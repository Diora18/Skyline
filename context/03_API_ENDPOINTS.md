# Skyline Student Association - API Endpoints

This document serves as the single source of truth for all API endpoints in the MERN platform.

## Global Configurations

**Base Path:** `/api`

**Standard Response Envelope:**
```json
{
  "success": true,
  "data": {},
  "message": "...",
  "errors": []
}
```

**Authentication:** 
- JWT Bearer token in the `Authorization` header (`Authorization: Bearer <token>`).

**Roles Hierarchy:**
- `student`
- `volunteer`
- `treasurer`
- `officer`

**Membership Status:**
- `none`
- `active`
- `expired`

---

## 1. AUTH ROUTES (`/api/auth`)

### POST `/api/auth/register`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "Khush Patel",
    "email": "khush@university.edu",
    "password": "securepass123",
    "studentId": "STU-2024-001",
    "phone": "555-0101",
    "major": "Computer Science",
    "graduationYear": 2026
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbG...",
      "user": {
        "_id": "5f8d0a...",
        "name": "Khush Patel",
        "email": "khush@university.edu",
        "studentId": "STU-2024-001",
        "role": "student",
        "membershipStatus": "none"
      }
    },
    "message": "Registration successful"
  }
  ```
- **Notes**: Password is hashed with bcryptjs before saving. Token expires in 7 days.

### POST `/api/auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "khush@university.edu",
    "password": "securepass123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbG...",
      "user": {
        "_id": "5f8d0a...",
        "name": "Khush Patel",
        "email": "khush@university.edu",
        "studentId": "STU-2024-001",
        "role": "student",
        "membershipStatus": "none"
      }
    },
    "message": "Login successful"
  }
  ```
- **Error (401)**:
  ```json
  {
    "success": false,
    "data": null,
    "message": "Invalid email or password"
  }
  ```

### GET `/api/auth/me`
- **Auth Required**: Yes (any role)
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "5f8d0a...",
        "name": "Khush Patel",
        "email": "khush@university.edu",
        "role": "student",
        "membershipStatus": "active"
      }
    },
    "message": "User fetched"
  }
  ```

---

## 2. MEMBER ROUTES (`/api/members`)

### GET `/api/members`
- **Auth Required**: Yes (Role: officer)
- **Query Params**: `?status=active&search=khush&page=1&limit=20`
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "members": [ ... ],
      "total": 142,
      "page": 1,
      "totalPages": 8
    },
    "message": "Members fetched"
  }
  ```

### GET `/api/members/:id`
- **Auth Required**: Yes (Any role, but students can only fetch their own)
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "5f8d0a...",
        "name": "Khush Patel",
        "email": "khush@university.edu",
        "role": "student",
        "membershipStatus": "active"
      }
    },
    "message": "Member fetched"
  }
  ```
- **Notes**: Returns the full user object (excluding the password).

### POST `/api/members/pay-dues`
- **Auth Required**: Yes (any role)
- **Request Body**:
  ```json
  {
    "amount": 25
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "5f8d0a...",
        "membershipStatus": "active",
        "membershipPaidAt": "2026-10-03T05:55:05Z",
        "membershipExpiresAt": "2027-10-03T05:55:05Z"
      }
    },
    "message": "Dues paid successfully"
  }
  ```
- **Business Logic / Side Effects**: Simulated payment. Updates user with `membershipStatus='active'`, `membershipPaidAt=now`, `membershipExpiresAt=now+1year`. Creates a Transaction record `{ type: 'income', category: 'dues', amount: 25 }`.

### GET `/api/members/me/volunteering`
- **Auth Required**: Yes (any authenticated role)
- **Response (200)**: `{ success: true, data: { applications: [...] } }`
- Each application includes its event, status, optional responsibility, review metadata, and timestamps. Results belong only to the authenticated user.

### Event-specific volunteer applications
- **POST `/api/events/:id/volunteers`** — Authenticated user applies to an upcoming published event. A second active application for the same event returns `409`; a rejected user may apply again, returning to `pending`.
- **GET `/api/events/:id/volunteers`** — Officer, event creator, or assigned event manager only. Returns applications and member identity fields for that event.
- **PATCH `/api/events/:id/volunteers/:applicationId`** — Officer, event creator, or assigned event manager only. Supports `status: 'approved' | 'rejected' | 'completed'` and optional `responsibility` (up to 120 characters). Only pending applications can be approved/rejected; only approved applications can be completed, and only after the event ends.
- **Application statuses**: `pending`, `approved`, `rejected`, `completed`. Applications are unique per user and event and persist independently of the user’s global role.

### PATCH `/api/members/:id/role`
- **Auth Required**: Yes (Role: officer)
- **Request Body**:
  ```json
  {
    "role": "volunteer"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "user": { ... }
    },
    "message": "Role updated successfully"
  }
  ```
- **Validation**: `role` must be one of: `student`, `volunteer`, `treasurer`, `officer`.

### POST `/api/members/:id/send-reminder`
- **Auth Required**: Yes (Role: officer)
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Renewal reminder sent to khush@university.edu"
  }
  ```
- **Notes**: Simulated for hackathon — just returns success without actually sending an email.

---

## 3. EVENT ROUTES (`/api/events`)

### GET `/api/events`
- **Auth Required**: No (public)
- **Query Params**: `?category=gala&status=published&sort=startDate&page=1&limit=12`
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "events": [
        {
          "_id": "6a9b1c...",
          "title": "Spring Gala",
          "category": "gala",
          "venue": "Student Center",
          "startDate": "2026-04-15T19:00:00Z",
          "memberPrice": 10,
          "nonMemberPrice": 15,
          "capacity": 150,
          "ticketsSold": 42,
          "status": "published"
        }
      ],
      "total": 5,
      "page": 1,
      "totalPages": 1
    },
    "message": "Events fetched"
  }
  ```
- **Notes**: By default only returns 'published' events for non-officers. Officers see all statuses.

### GET `/api/events/:id`
- **Auth Required**: No (public)
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "event": {
        "_id": "6a9b1c...",
        "title": "Spring Gala",
        "createdBy": {
          "name": "Admin Officer"
        }
      }
    },
    "message": "Event fetched"
  }
  ```
- **Notes**: Full event object with `createdBy` populated (name only).

### POST `/api/events`
- **Auth Required**: Yes (Role: officer)
- **Request Body**:
  ```json
  {
    "title": "Spring Gala 2026",
    "description": "Annual spring celebration...",
    "category": "gala",
    "bannerImage": "https://...",
    "venue": "Student Center Ballroom",
    "address": "123 Campus Dr",
    "startDate": "2026-04-15T19:00:00Z",
    "endDate": "2026-04-15T23:00:00Z",
    "memberPrice": 10,
    "nonMemberPrice": 15,
    "capacity": 150,
    "status": "published",
    "createLinkedProject": false
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "data": {
      "event": { ... }
    },
    "message": "Event created"
  }
  ```
- **Notes**: If `createLinkedProject` is true, also creates a Project linked to this event.

### PATCH `/api/events/:id`
- **Auth Required**: Yes (Role: officer OR event manager for this event)
- **Request Body**: Partial update — any subset of event fields.
  ```json
  {
    "capacity": 200
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": { "event": { ... } },
    "message": "Event updated"
  }
  ```
- **Notes**: Event managers (users in the event's `managers` array, or the `createdBy` user) can edit the event they manage. Officers can edit any event.

### DELETE `/api/events/:id`
- **Auth Required**: Yes (Role: officer)
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Event deleted"
  }
  ```
- **Notes**: Only officers can delete events. Event managers cannot delete.

### PATCH `/api/events/:id/managers`
- **Auth Required**: Yes (Role: officer)
- **Request Body**:
  ```json
  {
    "action": "add",
    "userId": "5f8d0a..."
  }
  ```
  *(OR to remove)*:
  ```json
  {
    "action": "remove",
    "userId": "5f8d0a..."
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "event": {
        "_id": "6a9b1c...",
        "title": "Spring Gala",
        "managers": [
          { "_id": "5f8d0a...", "name": "Riya Sharma", "email": "riya@university.edu" },
          { "_id": "7b2c3d...", "name": "Arjun Mehta", "email": "arjun@university.edu" }
        ]
      }
    },
    "message": "Event manager added"
  }
  ```
- **Validation**: `action` must be `add` or `remove`. `userId` must be a valid user. Cannot add duplicate managers. Returns populated `managers` array in response.
- **Notes**: Only officers can add/remove event managers. The `managers` array is returned with populated user names.

---

## 4. TICKET ROUTES (`/api/tickets`)

### POST `/api/tickets`
- **Auth Required**: Yes (any role)
- **Request Body**:
  ```json
  {
    "eventId": "6a9b1c..."
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "data": {
      "ticket": {
        "_id": "7b8c9d...",
        "ticketCode": "TKT-2026-0042",
        "event": "6a9b1c...",
        "user": "5f8d0a...",
        "ticketType": "member",
        "price": 10,
        "status": "valid"
      }
    },
    "message": "Ticket purchased"
  }
  ```
- **Business logic**:
  1. Check event exists and is published.
  2. Check capacity not reached (if capacity is set).
  3. Check user doesn't already have a ticket for this event.
  4. Determine `ticketType` from user's `membershipStatus` (`active` = member, else non-member).
  5. Set price from event's `memberPrice` or `nonMemberPrice` accordingly.
  6. Generate unique `ticketCode`.
  7. Increment `event.ticketsSold`.
  8. Create Transaction `{ type: 'income', category: 'ticket_sale', amount: price }`.

### GET `/api/tickets/my`
- **Auth Required**: Yes (any role)
- **Response (200)**: Array of user's tickets with event populated (`title`, `startDate`, `venue`).

### GET `/api/tickets/event/:eventId`
- **Auth Required**: Yes (Role: volunteer, treasurer, officer, event manager for this event, OR approved volunteer for this event)
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "tickets": [ ... ],
      "total": 42,
      "checkedIn": 28,
      "remaining": 14
    },
    "message": "Event tickets fetched"
  }
  ```

### POST `/api/tickets/scan`
- **Auth Required**: Yes (Role: volunteer, officer, event manager for the ticket's event, OR approved volunteer for the ticket's event)
- **Request Body**:
  ```json
  {
    "ticketCode": "TKT-2026-0042"
  }
  ```
- **Response Cases**:
  - **Valid (200)**:
    ```json
    { "success": true, "data": { "ticket": { ... }, "attendeeName": "Khush Patel" }, "message": "Valid ticket — Welcome, Khush Patel!" }
    ```
  - **Already used (400)**:
    ```json
    { "success": false, "data": { "checkedInAt": "2026-04-15T19:12:00Z" }, "message": "Already checked in at 7:12 PM" }
    ```
  - **Invalid (404)**:
    ```json
    { "success": false, "data": null, "message": "Invalid ticket code" }
    ```
- **Business logic**: If valid, set `status='used'`, set `checkedInAt=now`.

---

## 5. PRODUCT ROUTES (`/api/products`)

### GET `/api/products`
- **Auth Required**: No (public)
- **Query Params**: `?category=hoodie&active=true`
- **Response (200)**: Array of active products with variants.

### GET `/api/products/:id`
- **Auth Required**: No
- **Response (200)**: Full product with all variants.

### POST `/api/products`
- **Auth Required**: Yes (Role: officer)
- **Request Body**:
  ```json
  {
    "name": "Skyline Club Hoodie",
    "description": "Premium cotton hoodie...",
    "image": "https://...",
    "basePrice": 35,
    "category": "hoodie",
    "variants": [
      { "size": "S", "color": "Navy", "stock": 10 },
      { "size": "M", "color": "Navy", "stock": 15 },
      { "size": "L", "color": "Navy", "stock": 12 }
    ]
  }
  ```
- **Response (201)**: Created product object.

### PATCH `/api/products/:id`
- **Auth Required**: Yes (Role: officer)
- **Request Body**: Partial update of product fields.

### PATCH `/api/products/:id/stock`
- **Auth Required**: Yes (Role: officer)
- **Request Body**:
  ```json
  {
    "variantIndex": 1,
    "stock": 20
  }
  ```
- **Response (200)**: Updated product object.

---

## 6. ORDER ROUTES (`/api/orders`)

### POST `/api/orders`
- **Auth Required**: Yes (`membershipStatus` must be 'active')
- **Request Body**:
  ```json
  {
    "productId": "8c9d0e...",
    "variant": { "size": "M", "color": "Navy" },
    "quantity": 1
  }
  ```
- **Response (201)**: Created order object with `orderNumber`.
- **Business logic**:
  1. Verify user's `membershipStatus` is 'active'.
  2. Find matching variant, check `stock >= quantity`.
  3. Decrement variant stock, increment variant sold.
  4. Calculate `totalPrice = basePrice * quantity`.
  5. Generate `orderNumber`.
  6. Create Transaction `{ type: 'income', category: 'merch_sale', amount: totalPrice }`.

### GET `/api/orders/my`
- **Auth Required**: Yes (any role)
- **Response (200)**: User's orders with product populated (`name`, `image`).

### GET `/api/orders`
- **Auth Required**: Yes (Role: officer)
- **Query Params**: `?status=placed&page=1&limit=20`
- **Response (200)**: All orders with user and product populated.

### PATCH `/api/orders/:id/status`
- **Auth Required**: Yes (Role: officer)
- **Request Body**:
  ```json
  {
    "status": "confirmed"
  }
  ```
- **Validation**: Status transitions must follow: `placed` → `confirmed` → `ready` → `collected`. Also allows `any` → `cancelled`.

---

## 7. PROJECT ROUTES (`/api/projects`)

### GET `/api/projects`
- **Auth Required**: Yes (any role)
- **Response (200)**: All projects with task count summary (`total`, `done`).

### GET `/api/projects/:id`
- **Auth Required**: Yes (any role)
- **Response (200)**: Project with all tasks populated (with assignee name).

### POST `/api/projects`
- **Auth Required**: Yes (Role: officer)
- **Request Body**:
  ```json
  {
    "title": "Spring Bake Sale",
    "description": "Fundraiser to raise money for...",
    "deadline": "2026-04-01",
    "linkedEvent": "6a9b1c..."
  }
  ```
- **Response (201)**: Created project object.

### PATCH `/api/projects/:id`
- **Auth Required**: Yes (Role: officer)
- **Request Body**: Any subset of project fields.

---

## 8. TASK ROUTES (`/api/tasks`)

### POST `/api/tasks`
- **Auth Required**: Yes. Officers may create tasks in any project. An event creator/manager may create tasks only in a project linked to the event they manage.
- **Assignment rule**: Event managers must provide an `assignee` whose global role is `volunteer`; this is enforced by the API, not just the task form. Officer task assignment retains its existing permissions.
- **Request Body**:
  ```json
  {
    "title": "Buy baking supplies",
    "description": "Flour, butter, sugar...",
    "project": "9d0e1f...",
    "assignee": "5f8d0a...",
    "priority": "high",
    "dueDate": "2026-03-28",
    "supplies": ["Flour 2kg", "Butter 500g", "Sugar 1kg"]
  }
  ```
- **Response (201)**: Created task object.

### PATCH `/api/tasks/:id`
- **Auth Required**: Yes (assigned user or officer)
- **Request Body**: Any subset of task fields.
- **Validation**: A non-officer can only update the `status` field on a task assigned to them. Officers can change any task fields.

### DELETE `/api/tasks/:id`
- **Auth Required**: Yes (Role: officer)
- **Response (200)**: Deletion confirmation.

---

## 9. TREASURY ROUTES (`/api/treasury`)

### GET `/api/treasury/summary`
- **Auth Required**: Yes (Role: treasurer, officer)
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "totalIncome": 4250,
      "totalExpenses": 1180,
      "netBalance": 3070,
      "breakdown": {
        "dues": 1500,
        "ticket_sale": 1750,
        "merch_sale": 1000,
        "reimbursement": 1180
      }
    },
    "message": "Treasury summary fetched"
  }
  ```
- **Notes**: Computed by aggregating the Transaction collection.

### GET `/api/treasury/transactions`
- **Auth Required**: Yes (Role: treasurer, officer)
- **Query Params**: `?type=income&category=ticket_sale&startDate=2026-01-01&endDate=2026-06-30&page=1&limit=50`
- **Response (200)**: Paginated transactions list.

### POST `/api/treasury/transactions`
- **Auth Required**: Yes (Role: treasurer, officer)
- **Request Body**:
  ```json
  {
    "type": "income",
    "category": "other",
    "amount": 200,
    "description": "Cash donation from alumni"
  }
  ```
- **Notes**: For manually recording cash transactions not captured by other automated flows.

---

## 10. EXPENSE ROUTES (`/api/expenses`)

### POST `/api/expenses`
- **Auth Required**: Yes. Global Volunteer, Treasurer, and Officer roles may submit as before. A member may also submit a claim when they have an `approved` or `completed` volunteer application for the supplied event.
- **Request Body**:
  ```json
  {
    "amount": 23.50,
    "category": "supplies",
    "description": "Baking supplies for fundraiser",
    "event": "6a9b1c...",
    "linkedProject": "9d0e1f...",
    "receiptUrl": "https://..."
  }
  ```
- `event` is optional for global expense roles. If supplied by a member relying on an event assignment, the API verifies the user's application is `approved` or `completed`. The event is stored on the claim; its linked project is attached when available.
- **Response (201)**: Created expense object with status 'submitted'.

### GET `/api/expenses/my`
- **Auth Required**: Yes (authenticated user; returns only their claims)
- **Response (200)**: User's own expense claims.

### GET `/api/expenses`
- **Auth Required**: Yes (Role: treasurer, officer)
- **Query Params**: `?status=submitted&page=1&limit=20`
- **Response (200)**: All expenses with `submittedBy` populated.

### PATCH `/api/expenses/:id/review`
- **Auth Required**: Yes (Role: treasurer, officer)
- **Request Body**:
  ```json
  {
    "action": "approve"
  }
  ```
  *(OR for rejection)*:
  ```json
  {
    "action": "reject",
    "rejectionReason": "Receipt unclear, please resubmit"
  }
  ```
- **Business logic**: Sets status to `approved` or `rejected`. Sets `reviewedBy` and `reviewedAt`.

### PATCH `/api/expenses/:id/reimburse`
- **Auth Required**: Yes (Role: treasurer, officer)
- **Response (200)**: Confirmation of reimbursement.
- **Business logic**: Sets status to `reimbursed`, creates Transaction `{ type: 'expense', category: 'reimbursement', amount }`.

---

## 11. ANNOUNCEMENT ROUTES (`/api/announcements`)

### GET `/api/announcements`
- **Auth Required**: No (public)
- **Query Params**: `?category=urgent&page=1&limit=20`
- **Response (200)**: Paginated announcements sorted by `createdAt` desc, with `postedBy` populated (name).

### POST `/api/announcements`
- **Auth Required**: Yes (Role: officer)
- **Request Body**:
  ```json
  {
    "title": "General Body Meeting",
    "body": "Our next GBM will be on...",
    "category": "meeting",
    "sendEmail": true
  }
  ```
- **Response (201)**: Created announcement object. `emailSent` is true if `sendEmail` was true.
- **Notes**: Email sending is simulated for the hackathon.

### DELETE `/api/announcements/:id`
- **Auth Required**: Yes (Role: officer)
- **Response (200)**: Deletion confirmation.
