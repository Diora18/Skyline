<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/UI-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Vite" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Payments-Razorpay-0D47A1?style=for-the-badge" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Check--In-QR%20Scanner-111111?style=for-the-badge" alt="QR Scanner" />
</p>

# 🌄 Skyline SSA — Unified Club Management Platform

> **"One club. One ledger. One door list."**

Skyline Student Association (SSA) is a **full-stack campus club platform** that lets a university student organization run membership, events, merchandise, volunteer projects, and treasury in one place. Students join and pay dues, officers plan the semester, volunteers scan tickets at the door, and the treasurer closes the books — all scoped by role and membership status.

---

## 📌 Why Skyline?

### The Problem

- **Paper sign-ups** at campus tables lose dues and leave nobody sure who has active perks.
- **Door ticketing** relies on cash envelopes and printed lists, so attendance and profit stay unknown.
- **Announcements** drown in group chats; new members have no archive.
- **Merch orders** mix sizes on scrap paper and oversell stock.
- **Volunteer work** lives in someone's head; fundraisers have no shared task board.
- **Treasury** is notebook math and a shoebox of receipts — a painful handover to next year's officers.

### The Solution

Skyline SSA provides a **single club operating system** where:

- ✅ Students **register, pay dues, and carry a digital member ID** with a scannable QR.
- 🎟️ Events sell **member vs guest tickets**; door staff check in with a **camera QR scanner**.
- 📢 Officers publish a **searchable announcement board** instead of buried chat messages.
- 👕 Merch uses a **size/color variant catalog** with live stock and a pickup status pipeline.
- 📋 Fundraisers get **project workspaces** and a **To Do / In Progress / Done** Kanban.
- 💰 Dues, tickets, and merch **auto-post to the ledger**; volunteers submit receipts for treasurer review.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  ┌───────────────────┐    ┌───────────────────┐        │
│  │  Public Club Site │    │  Role Workspace   │        │
│  │  (React + Vite)   │    │  (React + Vite)   │        │
│  └────────┬──────────┘    └────────┬──────────┘        │
│           │ REST                   │ REST               │
└───────────┼────────────────────────┼────────────────────┘
            │                        │
┌───────────▼────────────────────────▼────────────────────┐
│              Backend Service Layer                       │
│              Express.js REST API (Port 5000)             │
│    (JWT Auth · Middleware · Controllers · Routes)        │
└──────┬─────────────────┬──────────────────┬─────────────┘
       │                 │                  │
┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────────────┐
│  MongoDB    │  │    Multer     │  │  External APIs      │
│  (Primary   │  │  (Receipt     │  │  • Razorpay Sandbox  │
│   Database) │  │   Uploads)    │  │                      │
└─────────────┘  └───────────────┘  └──────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer         | Technology                                                      |
| ------------- | --------------------------------------------------------------- |
| **Frontend**  | React 19, Vite 5, React Router DOM 7, Tailwind CSS 4, Base UI / shadcn, Lucide |
| **Backend**   | Node.js, Express.js 4, Mongoose 8, express-validator, Multer, CORS |
| **Database**  | MongoDB (`skyline_ssa`)                                         |
| **Auth**      | JWT (Bearer token), bcryptjs, role middleware                   |
| **Payments**  | Razorpay (Test Mode / Sandbox), optional `PAYMENT_SIMULATION`   |
| **QR**        | `qrcode.react` (generation), `html5-qrcode` (camera scanning)   |
| **HTTP**      | Axios / fetch service layer; Vite proxies `/api` → port 5000    |

---

## ✨ Key Features

### 👤 Student Experience
- **Sign Up / Login** — Register with student details; new accounts start as `student` with membership `none`.
- **Join Membership** — Pay demo dues to activate one year of membership and a digital member ID.
- **Browse Events** — View published events with member vs guest pricing and remaining capacity.
- **Buy Tickets** — Purchase a ticket and open a scannable QR pass under My Tickets.
- **Shop Merch** — Order in-stock size/color variants (active membership required).
- **Volunteer for Events** — Apply per event and track pending, approved, rejected, or completed status.
- **Personal Hub** — View own tickets, orders, expense claims, and volunteering history.

### 🎟️ Events, Door Check-In & Volunteering
- **Event Management** — Officers create, edit, and delete events; assign event managers.
- **Scoped Managers** — Event managers edit only their event, review its volunteer applications, and scan that door.
- **QR Door Scanner** — Camera check-in with valid / already-used / invalid feedback and a manual code fallback.
- **Event Volunteers** — Approved assignees get that event's attendee list, scanner, and expense shortcuts.
- **Kanban Projects** — To Do / In Progress / Done boards with assignees, due dates, and supplies.

### 💳 Treasury & Payments
- **Auto Ledger** — Dues, ticket sales, and merch orders write income entries automatically.
- **Expense Claims** — Volunteers (and authorized event assignees) submit receipts for review.
- **Treasurer Queue** — Approve, reject, or reimburse claims; reimbursement posts an outflow.
- **Razorpay Checkout** — Test-mode orders with signature verify (optional local payment simulation).
- **Executive Totals** — Inflow, outflow, net cash, and transaction history.

### 🏢 Officer Dashboard
- **Members** — Search the directory, change global roles, send simulated renewal reminders.
- **Inventory** — Maintain product variants and stock.
- **Orders** — Advance fulfillment: `placed` → `confirmed` → `ready` → `collected`.
- **Announcements** — Publish or delete the public bulletin.
- **Treasury Access** — Officers share financial review with the treasurer.

---

## 📁 Project Structure

```
Skyline/
├── server/                     # Express.js API server
│   ├── config/                 # Database connection config
│   ├── controllers/            # Route handlers (auth, events, merch, treasury, etc.)
│   ├── middleware/             # JWT auth & role-based access middleware
│   ├── models/                 # Mongoose schemas (User, Event, Ticket, Product, etc.)
│   ├── routes/                 # Express route definitions
│   ├── utils/                  # Helpers (ticket/order codes, validation)
│   ├── server.js               # HTTP server entry point
│   ├── seed.js                 # Database seeder with demo data
│   ├── .env.example            # Environment variable template
│   └── package.json
│
├── client/                     # React + Vite client
│   ├── src/
│   │   ├── components/         # Reusable UI (header, layout, club sections, widgets)
│   │   ├── context/            # AuthContext (user, token, role, membership)
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Screen-level components
│   │   ├── services/           # API wrappers
│   │   ├── utils/              # Helpers and Razorpay checkout
│   │   ├── App.jsx             # Root component with React Router
│   │   └── main.jsx            # Vite entry point
│   ├── public/                 # Static assets
│   ├── vite.config.js          # Vite dev server + /api proxy
│   └── package.json
│
├── context/                    # API contracts, schemas, and screen specifications
├── USER_WORKFLOWS.md           # Role-by-role product guide
├── CURRENT_STATUS.md           # Implementation notes
└── PROGRESS_TRACKER.md         # Development progress tracker
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your system:

| Tool        | Version   | Download Link                                      |
| ----------- | --------- | -------------------------------------------------- |
| **Node.js** | ≥ 18 LTS  | [nodejs.org](https://nodejs.org/)                   |
| **MongoDB** | ≥ 6.0     | [mongodb.com](https://www.mongodb.com/try/download) |
| **Git**     | Any       | [git-scm.com](https://git-scm.com/)                |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Diora18/Skyline.git
cd Skyline
```

---

### Step 2 — Backend Setup

```bash
cd server
npm install
```

Create the environment file from the provided template:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/skyline_ssa
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
PAYMENT_SIMULATION=false
```

> **Note**: For local development without Razorpay, you can leave those keys blank and keep `PAYMENT_SIMULATION=false` — core auth, events, merch, and treasury still work. Set `PAYMENT_SIMULATION=true` only for local demo simulation.

---

### Step 3 — Seed the Database

Make sure MongoDB is running, then populate demo data:

```bash
npm run seed
```

> **Warning**: Seed **drops every collection** in that database, then inserts a full demo club. Do not run it against production.

This creates:
- 👤 **12 Users** (officers, treasurer, volunteers, active / expired / none members)
- 🎟️ **Events & Tickets** with member and guest pricing
- 👕 **Products & Orders** with variant stock
- 📋 **Projects, Tasks & Announcements**
- 💰 **Expenses & Ledger Transactions**

---

### Step 4 — Start the Backend Server

```bash
npm run dev
```

The API server starts at **`http://localhost:5000`**. Verify it's running:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "uptime": 1.23,
    "timestamp": "2026-10-04T03:00:00.000Z",
    "environment": "development"
  },
  "message": "Skyline Student Association API is operational"
}
```

---

### Step 5 — Frontend Setup

Open a **new terminal** and run:

```bash
cd client
npm install
```

Vite proxies `/api` to `http://localhost:5000` by default. An optional frontend env file (if you add one) can look like:

```env
VITE_API_URL=http://localhost:5000/api
```

The defaults should work out of the box without a client `.env`.

---

### Step 6 — Start the Frontend Dev Server

```bash
npm run dev
```

The React app starts at **`http://localhost:5173`**. Open it in your browser and you're ready to go! 🎉

---

## 🔑 Demo Credentials

After running `npm run seed`, use these accounts to explore the platform:

| Role          | Email                   | Password        | Status | Description                                      |
| ------------- | ----------------------- | --------------- | ------ | ------------------------------------------------ |
| **Officer**   | `admin@skyline.edu`     | `Password123!`  | Active | Full admin: members, events, inventory, treasury |
| **Officer**   | `president@skyline.edu` | `Password123!`  | Active | Same officer permissions                         |
| **Treasurer** | `treasurer@skyline.edu` | `Password123!`  | Active | Ledger, claims review, reimbursements            |
| **Volunteer** | `carlos@skyline.edu`    | `Password123!`  | Active | Global scanner and expense submit                |
| **Volunteer** | `mei@skyline.edu`       | `Password123!`  | Active | Same volunteer permissions                       |
| **Student**   | `david@skyline.edu`     | `Password123!`  | Active | Member prices and merch checkout                 |
| **Student**   | `alex@skyline.edu`      | `Password123!`  | None   | Guest ticket price; no merch checkout            |

> **Membership**: Paying dues changes `membershipStatus`, not the global role. New sign-ups at `/register` are always `student` / `none`.

### Quick Test Walkthrough

1. **Login as Officer** (`admin@skyline.edu`) → Open **Members**, **Events**, **Inventory**, and **Orders**.
2. **Login as Active Student** (`david@skyline.edu`) → Buy a ticket, open **My Tickets**, order merch, apply to volunteer.
3. **Login as Non-Member** (`alex@skyline.edu`) → See guest pricing → **Join Membership** to activate demo dues.
4. **Login as Volunteer** (`carlos@skyline.edu`) → Use the **Scanner**, then submit an expense claim.
5. **Login as Treasurer** (`treasurer@skyline.edu`) → Open **Treasury** and **Claims** to approve / reimburse.

---

## 📡 API Endpoint Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <JWT_TOKEN>`.

<details>
<summary><strong>🔓 Authentication (Public)</strong></summary>

| Method | Endpoint              | Description                          |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/api/health`         | Service health                       |
| POST   | `/api/auth/register`  | Register a new account (`student`)   |
| POST   | `/api/auth/login`     | Login and receive JWT token          |
| GET    | `/api/auth/me`        | Get logged-in user (protected)       |

</details>

<details>
<summary><strong>👤 Members & Profile (Protected)</strong></summary>

| Method | Endpoint                         | Description                          |
| ------ | -------------------------------- | ------------------------------------ |
| GET    | `/api/members`                   | List members (officer)               |
| GET    | `/api/members/:id`               | Get member by id                     |
| POST   | `/api/members/pay-dues`          | Activate membership (demo dues)      |
| PATCH  | `/api/members/:id/role`          | Update global role (officer)         |
| POST   | `/api/members/:id/send-reminder` | Simulated renewal reminder (officer) |
| GET    | `/api/members/me/volunteering`   | Current user's event applications    |

</details>

<details>
<summary><strong>🎟️ Events & Tickets (Protected where noted)</strong></summary>

| Method | Endpoint                      | Description                         |
| ------ | ----------------------------- | ----------------------------------- |
| GET    | `/api/events`                 | List events                         |
| GET    | `/api/events/:id`             | Get event details                   |
| POST   | `/api/events`                 | Create event (officer)              |
| PATCH  | `/api/events/:id`             | Update event (officer / manager)    |
| DELETE | `/api/events/:id`             | Delete event                        |
| PATCH  | `/api/events/:id/managers`    | Assign managers (officer)           |
| POST   | `/api/tickets`                | Purchase a ticket                   |
| GET    | `/api/tickets/my`             | Get my tickets                      |
| GET    | `/api/tickets/event/:eventId` | Event attendee / check-in list      |
| POST   | `/api/tickets/scan`           | Scan a ticket at the door           |

</details>

<details>
<summary><strong>👕 Products & Orders (Protected where noted)</strong></summary>

| Method | Endpoint                  | Description                      |
| ------ | ------------------------- | -------------------------------- |
| GET    | `/api/products`           | List catalog                     |
| GET    | `/api/products/:id`       | Get product details              |
| POST   | `/api/products`           | Create product (officer)         |
| PATCH  | `/api/products/:id`       | Update product (officer)         |
| PATCH  | `/api/products/:id/stock` | Update variant stock (officer)   |
| POST   | `/api/orders`             | Place an order (active member)   |
| GET    | `/api/orders/my`          | Get my orders                    |
| GET    | `/api/orders`             | List all orders (officer)        |
| PATCH  | `/api/orders/:id/status`  | Update fulfillment (officer)     |

</details>

<details>
<summary><strong>📋 Projects, Tasks & Volunteering (Protected)</strong></summary>

| Method | Endpoint                                    | Description                                |
| ------ | ------------------------------------------- | ------------------------------------------ |
| GET    | `/api/projects`                             | List projects                              |
| GET    | `/api/projects/:id`                         | Get project and tasks                      |
| POST   | `/api/projects`                             | Create project (officer)                   |
| PATCH  | `/api/projects/:id`                         | Update project (officer)                   |
| POST   | `/api/tasks`                                | Create task (officer / linked manager)     |
| PATCH  | `/api/tasks/:id`                            | Update task (officer / assignee rules)     |
| DELETE | `/api/tasks/:id`                            | Delete task (officer)                      |
| POST   | `/api/events/:id/volunteers`                | Apply as event volunteer                   |
| GET    | `/api/events/:id/volunteers`                | List applications for an event             |
| PATCH  | `/api/events/:id/volunteers/:applicationId` | Approve / reject / complete an application |

</details>

<details>
<summary><strong>💳 Treasury, Expenses & Payments (Protected)</strong></summary>

| Method | Endpoint                      | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| GET    | `/api/treasury/summary`       | Get totals (treasurer/officer) |
| GET    | `/api/treasury/transactions`  | Get ledger (treasurer/officer) |
| POST   | `/api/treasury/transactions`  | Create manual entry            |
| POST   | `/api/expenses`               | Submit an expense claim        |
| GET    | `/api/expenses/my`            | Get my claims                  |
| GET    | `/api/expenses`               | List all claims                |
| PATCH  | `/api/expenses/:id/review`    | Approve or reject a claim      |
| PATCH  | `/api/expenses/:id/reimburse` | Mark a claim reimbursed        |
| POST   | `/api/payments/create-order`  | Create Razorpay order          |
| POST   | `/api/payments/verify`        | Verify payment signature       |
| POST   | `/api/payments/webhook`       | Razorpay webhook               |

</details>

<details>
<summary><strong>🏢 Announcements & Team</strong></summary>

| Method | Endpoint                 | Description              |
| ------ | ------------------------ | ------------------------ |
| GET    | `/api/announcements`     | Public announcement board |
| POST   | `/api/announcements`     | Create (officer)         |
| DELETE | `/api/announcements/:id` | Delete (officer)         |
| GET    | `/api/team`              | Public team list         |
| POST   | `/api/team`              | Add member (officer)     |
| PUT    | `/api/team/:id`          | Update (officer)         |
| DELETE | `/api/team/:id`          | Remove (officer)         |

</details>

---

## 🔌 Roles, Membership & Door Scan

Skyline has no WebSocket layer. Access is JWT + role/membership, and door check-in is a REST scan.

| Concept                 | Direction / Actor      | Description                                         |
| ----------------------- | ---------------------- | --------------------------------------------------- |
| Global role             | Account                | `student`, `volunteer`, `treasurer`, or `officer`   |
| Membership status       | Account                | `none`, `active`, or `expired` (independent of role)|
| Event manager           | Officer assigns        | Edit, volunteer review, and scan for that event only|
| Event volunteer         | Member applies         | `pending` → `approved` / `rejected` → `completed`   |
| `POST /api/tickets/scan`| Door staff → Server    | Validate ticket code for the authorized event       |
| Valid ticket            | Server → Client        | First scan accepted; ticket marked used             |
| Already used / invalid  | Server → Client        | Reject duplicate, cancelled, missing, or wrong event|

---

## 🧩 Environment Variables Summary

### Backend (`server/.env`)

| Variable                   | Required | Description                              |
| -------------------------- | -------- | ---------------------------------------- |
| `PORT`                     | No       | Server port (default: `5000`)            |
| `MONGO_URI`                | Yes      | MongoDB connection string                |
| `JWT_SECRET`               | Yes      | Secret key for signing JWT tokens        |
| `JWT_EXPIRES_IN`           | No       | Token lifetime (default: `7d`)           |
| `NODE_ENV`                 | No       | `development` or `production`            |
| `RAZORPAY_KEY_ID`          | No       | Razorpay test key ID                     |
| `RAZORPAY_KEY_SECRET`      | No       | Razorpay test key secret                 |
| `RAZORPAY_WEBHOOK_SECRET`  | No       | Only if you configure Razorpay webhooks  |
| `PAYMENT_SIMULATION`       | No       | `true` only for local demo simulation    |

### Frontend (`client/.env`)

| Variable        | Required | Description                                      |
| --------------- | -------- | ------------------------------------------------ |
| `VITE_API_URL`  | No       | Optional API base URL; Vite `/api` proxy is used |

---

## 📜 Available Scripts

### Root Directory

This repo has no root `package.json`. Run scripts from `server/` and `client/` as below.

### Backend (`cd server`)

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start backend with nodemon (hot-reload) |
| `npm start`       | Start backend in production mode     |
| `npm run seed`    | Populate database with demo data     |

### Frontend (`cd client`)

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite dev server                |
| `npm run build`   | Build for production                 |
| `npm run preview` | Preview production build             |
| `npm run lint`    | Run Oxlint                           |

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Follow the contracts in `context/` — update them if your changes modify API routes, payloads, or schemas.
3. Include sample request/response JSON in backend PRs.
4. Include screenshots or screen recordings in frontend PRs.
5. Open a Pull Request and reference the screens/routes you've touched.

See [USER_WORKFLOWS.md](USER_WORKFLOWS.md) for role rules and [context/01_PROJECT_RULES.md](context/01_PROJECT_RULES.md) for conventions.

---

## 📄 License

This project is for educational and demonstration purposes.

---

<p align="center">
  Built with ❤️ by the Skyline SSA Team
</p>
