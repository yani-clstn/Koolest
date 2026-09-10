
# Koolest 

![Koolest](./src/assets/Koolest-main.png)

[![Status](https://img.shields.io/badge/Status-Deployed-00C853?style=for-the-badge&logo=vercel)](https://koolest.vercel.app)
[![Audience](https://img.shields.io/badge/Audience-Homeowners%20%26%20Businesses-7B2CBF?style=for-the-badge)](https://koolest.vercel.app)
[![Platform](https://img.shields.io/badge/Type-Web%20Application-0284C7?style=for-the-badge)](https://koolest.vercel.app)

The public site includes a floating Koolest Assistant chatbot. It uses the server-side `/api/chat` route, so the provider key is never exposed in the browser.

**Live Site:** [koolest.vercel.app](https://koolest.vercel.app)
---

A web-based booking and administrative management application for **Koolest Aircon Services**, enabling customers to schedule air conditioning services online and providing administrators with a secure dashboard to manage appointments, track schedules via an interactive calendar, send automatic email notifications, and handle customer feedback and issue reports.

---
# Preview & Showcase
![Koolest-booking](./src/assets/Koolest-booking.png)
---
![Koolest-feedback](./src/assets/Koolest-feedback.png)
---

# Key Features

### Public & Customer Facing
* **Modern & Responsive UI/UX:** Built with a Deep Teal, Bright Cyan, and Crisp White visual language optimized for high contrast, readability, and mobile responsiveness across all devices.
* **Interactive Service Booking Pipeline:** Step-by-step booking form allowing customers to select services, choose dates/times, and submit contact details.
* **Live Automated Input Formatting:** Features real-time field masks including live Proper Case full-name auto-capitalization and strict 11-digit phone formatting, submitted asynchronously via `fetch`.
* **Smart Booking Boundary Checks & Anti-Abuse:**
  * Prevents past dates and enforces a minimum 1-day advance notice window.
  * Caps far-future bookings to a 90-day maximum limit.
  * Prevents overbooking by capping daily total submissions (5 slots/day) and blocking exact duplicate client slots.
* **Rate Limiting & Spam Protection:** Leverages Upstash Redis (`@upstash/ratelimit`) with sliding-window rate limiting per IP address to prevent spam and DDoS attempts.
* **Native Inline Validation UX:** Connects server-side validation responses directly to HTML5 constraint validation (`setCustomValidity()` and `reportValidity()`), anchoring error tooltips directly to specific form inputs.
* **Data Privacy Act (DPA) Compliance:** Integrated DPA / Privacy Policy consent checkbox and explicit modal to ensure customer data handling compliance prior to submission.
* **Customer Feedback & Rating System:** Dedicated interface for customers to rate services and leave feedback.
* **Escalation & Issue Reporting:** Integrated endpoints and quick reporting tools for customers to log service or technical issues.

---

### Admin Dashboard & Management
* **Google OAuth Protected Control Panel:** Secured `/admin.html` dashboard for managing bookings, customer feedback, and issue escalation reports.
* **Granular Identity Verification:** Server-side token verification using `google-auth-library` ensuring only the designated `ADMIN_EMAIL` can view or update records.
* **Interactive Admin Calendar View:** Full-month and week schedule visualization powered by FullCalendar, featuring whole-day tile color coding by booking status (e.g., green for confirmed, muted for past dates) and click-to-view detail modals.
* **Real-time Booking Table UX:** Filterable and sortable table of all bookings, with completed bookings automatically sorted to the bottom with green status highlights.
* **Status Workflows & Email Notifications:** Manage booking lifecycles (`PENDING` → `CONFIRMED` → `COMPLETED` / `CANCELLED`) with automatic customer notification emails sent via Resend API (includes a developer test mode).
* **Feedback & Issue Management:** Dedicated admin tabs to review, process, and resolve submitted customer feedback and issue reports.
* **Search Engine Shielding:** Configured `robots.txt` and `<meta name="robots" content="noindex, nofollow">` on admin interfaces to prevent search engine indexing.

---

# Tech Stack & Architecture

* **Frontend:** HTML5, Tailwind CSS (compiled via CLI to `public/output.css`), Vanilla JavaScript (ES6+), FullCalendar.js.
* **Backend:** Node.js, Express.js / Vercel Serverless Functions (ES Modules `.mjs`).
* **Database & ORM:** Neon Serverless PostgreSQL with Prisma ORM using `@prisma/adapter-neon` and `TIMESTAMPTZ` timezone support set to `Asia/Manila`.
* **Validation:** Zod Schema Validation (`booking.js`).
* **Rate Limiting:** Upstash Redis REST API (`@upstash/redis`, `@upstash/ratelimit`).
* **Email Service:** Resend API.
* **Authentication:** Google Identity Services (GIS) Client SDK + Server-side Verification (`google-auth-library`).
* **Deployment & Hosting:** Vercel Platform (Serverless Functions & Static Hosting).

---

# Security & Session Management

* **Dual-Layer Session Security:**
  * **Inactivity Protection:** 15-minute automatic inactivity timer that clears sessions upon idle detection.
  * **Token Expiry Lifecycle:** Proactively manages the ~1-hour Google ID Token expiry window via re-authentication timers and reactive `401`/`403` status handling on API requests.
* **Backend Authentication Middleware:** Verifies Google JWT ID Tokens against allowed admin Google accounts on every API request.
* **Deployment Security Headers:** Configured via `vercel.json` (Content Security Policy (CSP), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) to harden the application against cross-site scripting (XSS) and clickjacking.

---

## Database Schema (Prisma)

```prisma

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

model Booking {
  id          String   @id @default(cuid())
  email       String    
  phone       String
  bookingDate DateTime @map("bookingDate")
  createdAt DateTime @default(now()) @db.Timestamptz(6)
  fullName    String?   @map("fullName")
  serviceType String   @map("serviceType")
  notes String? @map("notes")
  location    String?        @map("location")
  status      BookingStatus @default(PENDING)

  @@map("Booking") // Ensures Prisma targets the exact "Booking" table name
}

model Feedback {
  id        String   @id @default(cuid())
  name      String
  rating    Int
  message   String
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  @@map("Feedback")
}

enum IssueType {
  BROKEN_LINK_OR_BUTTON
  VISUAL_LAYOUT_GLITCH
  FORM_SUBMISSION_ERROR
  MOBILE_SCREEN_DISPLAY
  OTHER_WEBSITE_BUG
}

model IssueReport {
  id        String    @id @default(cuid())
  name      String?
  email     String
  issueType IssueType
  details   String
  createdAt DateTime @default(now()) @db.Timestamptz(6)

  @@map("IssueReport")
}




```

---

## Project Structure

```text
koolest/
├── api/                   # Express.js backend & serverless endpoints
│   ├── admin           # Server entry point & route registration
│   └── client
├── admin/
│   └── admin.html
├── genrated/prisma
│   └── schema.prisma      # Database schema definitions
├── public/                # Static assets & public web pages
│   ├── assets
│   ├── admin.html         # Secure admin dashboard & calendar view
│   ├── report-issue.html  # Issue reporting page
│   ├── output.css         # Compiled Tailwind CSS output
│   ├── js                # Client-side JS scripts (booking, admin, fullcalendar logic)
│   │   └── report-issue.js
│   └── robots.txt         # Crawler disallow configuration for admin routes
├── src/
│   ├── assets
│   │   ├── libs
│   │   │   ├── validations  # Bookings, Feddback and Report Page Zod validation
│   │   │   │   ├── booking.js
│   │   │   │   ├── feedback.js
│   │   │   │   ├── issue.js
│   │   │   │   ├── test-validation.ts
│   │   │   ├── email.js
│   │   │   ├── prisma.js
│   │   │   ├── ratelimit.js
│   │   │   ├── ratelimit.ts
│   │   ├── // assets here
│   └── generated          # Tailwind CSS source entry file
│   │   └── input.css
├── .gitignore
├── index.html
├── package.json           # Dependencies and build scripts
├── package-lock.json      # Dependencies and build scripts
├── prisma.config.ts
├── script.js
├── skills-lock.json
├── vercel.json            # Deployment routing & security headers configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json           
├── .env.local 
└── .env                   # Environment variables (git-ignored)

```

---

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/koolest_db?schema=public"

# Google Auth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
ALLOWED_ADMIN_EMAILS="admin1@gmail.com,admin2@gmail.com"

# Resend Email Integration
RESEND_API_KEY="re_123456789..."
FROM_EMAIL="Koolest Aircon Services <onboarding@resend.dev>"

# Email Testing Mode (Redirects all outbound status emails to developer during staging)
EMAIL_TEST_MODE="true"
TEST_RECIPIENT_EMAIL="your-test-email@example.com"

# AI Assistant (OpenAI-compatible Chat Completions API)
OPENAI_API_KEY="your-api-key"
OPENAI_MODEL="gpt-4o-mini"
# Optional: use another OpenAI-compatible provider endpoint
# OPENAI_API_URL="https://api.openai.com/v1/chat/completions"

```

---

## Build & Local Development Setup

1. **Install Dependencies:**
```bash
npm install

```


2. **Generate Prisma Client & Run Migrations:**
```bash
npx prisma generate
npx prisma db push

```


3. **Build Tailwind CSS:**
For local development watch mode:
```bash
npx tailwindcss -i ./src/input.css -o ./public/output.css --watch

```


For production build:
```bash
npx tailwindcss -i ./src/input.css -o ./public/output.css --minify

```


4. **Start Development Server:**
```bash
npm run dev

```



---

## Vercel Deployment Notes

* **Build Command:** Configure Vercel's Build Command in Project Settings to run the Tailwind compilation step alongside Prisma generation:
```bash
npx tailwindcss -i ./src/input.css -o ./public/output.css --minify && npx prisma generate

```


* **Output Directory:** Default static output serves from `public/`.
* **Environment Variables:** Ensure all keys listed under **Environment Configuration** are registered in the Vercel Dashboard Settings.

---

## License

This project is proprietary software developed for Koolest Aircon & Appliance Services. All rights reserved.



