<div align="center">

# Tertiary Exams

[![Live](https://img.shields.io/badge/Live-exams.tertiaryinfotech.com-6d28d9?style=flat-square)](https://exams.tertiaryinfotech.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI-412991?style=flat-square&logo=openai)](https://platform.openai.com)
[![Download on the App Store](https://img.shields.io/badge/Download_on_the-App_Store-0D96F6?style=flat-square&logo=apple)](https://apps.apple.com/us/app/tertiary-ai-exams/id6781995308)

**Practice smarter for your next certification.**

[Live Site](https://exams.tertiaryinfotech.com) · [Catalog](https://exams.tertiaryinfotech.com/practice-exams) · [iOS App](https://apps.apple.com/us/app/tertiary-ai-exams/id6781995308)

<a href="https://apps.apple.com/us/app/tertiary-ai-exams/id6781995308">
  <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" alt="Download Tertiary AI Exams on the App Store" height="48" />
</a>

</div>

Tertiary Exams is a full-stack certification practice-exam platform designed for commercial training and certification-preparation providers. It allows users to browse certifications, take free teaser attempts, buy a certification's practice exam on its own or with a real-exam voucher, and take timed or practice-mode exams — every attempt drawn fresh from a question pool weighted by the official exam domains — with per-domain result breakdowns. The platform includes a robust admin backend with AI-assisted question generation, dynamic e-commerce features (Stripe, PayPal, HitPay, PayNow), invoicing, and voucher fulfillment.

## Table of Contents

- [Overview](#overview)
- [Screenshot](#screenshot)
- [Features](#features)
- [Certification Catalog](#certification-catalog)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Scripts](#scripts)
- [Usage](#usage)
- [Database](#database)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Known Issues](#known-issues)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

Tertiary Exams is built to provide an end-to-end e-commerce and exam-taking experience. It solves the problem of managing certification preparation platforms by selling one practice exam per certification — as practice-only or with a real-exam voucher included — backed by a question pool grouped by exam domain. The platform is designed for scalable content generation using OpenAI (with DeepSeek and MiniMax fallbacks), enabling administrators to quickly author and maintain a large library of high-quality, blueprint-aligned practice questions.

**Current Status:** The core application features, checkout flows, exam runners, and admin dashboards are implemented and functioning.

## Screenshot

![Tertiary Exams — home screen](docs/images/screenshot.png)

## Features

- **Two product categories:** every Certification is sold as a **Practice Exam** (always US$20, unlimited retakes) and, where available, an **Exam Voucher** (official vendor voucher with the Practice Exam included free). Each has its own page, URL, title and description — `/practice-exams/<vendor>/<slug>` and `/exam-vouchers/<vendor>/<voucher-slug>` — and buying the voucher grants the linked Practice Exam automatically.
- **Marketing homepage:** animated hero, a two-category showcase (Practice Exams vs. the "Best value" Exam Vouchers), popular certifications showing both prices, a vendor strip, how it works, testimonials and FAQ. Mobile menu, sticky phone buy bars, and `prefers-reduced-motion` support.
- **Public Catalogs:** `/practice-exams` and `/exam-vouchers` with Vendor/level search and pagination; each card shows the Practice Exam price and the Exam Voucher option. The voucher pages carry how it works and a voucher FAQ (with FAQ structured data for search).
- **Admin Catalog:** **Practice Exams** and **Exam Vouchers** lists with their own edit pages — each Practice Exam page holds its listing (URL slug, price, on-sale switch) and the certification itself (exam title, code, duration, pass %, questions per exam, description, official exam page, exam domains & weights, and SEO meta with AI Assist), **+ Create Practice Exam** on the Practice Exams list (creates the question bank and its Practice Exam together; AI generation then fills it), and **Question Banks** for the questions themselves — generation, review queue and the question list with bulk Publish / Unpublish / Delete.
- **Exam Domains & References:** Each Practice Exam and Exam Voucher page shows the official domain percentages as an accordion that expands to the subtopics covered, plus a References section linking the vendor's official exam page and study guide.
- **Instructor-Led Exam Prep:** CompTIA, Linux Foundation, PMP, Microsoft and ITIL 4 Practice Exam and Exam Voucher pages carry a card linking to the matching WSQ or CASL classroom course on [tertiarycourses.com.sg](https://www.tertiarycourses.com.sg/) (`src/lib/instructor-led.ts`); certifications without a matching course show no card.
- **Domain-Weighted Question Pool:** Each certification's questions form a pool grouped by exam domain. Every attempt (Practice, Exam mode, teaser, retake) is a fresh random draw in proportion to the official domain percentages, verified against each vendor's exam guide (`src/lib/exam-blueprints.ts`); a short domain's seats are re-apportioned to the others.
- **Multiple Payment Gateways:** Checkout support for Stripe, PayPal, HitPay, and PayNow with promo codes, billing addresses, and an integrated GST engine — every storefront price is labelled **GST inclusive** and the 9% rate, label and registration number are admin settings (**Settings → GST & Invoice**). An in-admin **Payment Setup Guide** documents provider configuration step by step with live status checks.
- **Test-Centre Exam Runner:** A full-screen, test-centre style session. **Exam mode** (the default) runs like the live test: a **Time Remaining** countdown from the exam's official duration (e.g. 2:00:00 for CCAO-F), **Flag for review** on every question, no answers revealed and no answer sheet — Next on the last question opens the **Review Screen** (Completed / Flagged for review summary and a one-column per-question table) with **Review flagged questions**, **Review all** and **Submit Exam**. **Practice mode** is untimed, reveals the answer, explanation and exam domain after each question, shows an answer sheet, and offers **Switch to Exam mode** in the title bar. Per-answer autosave, auto-submit at zero, Save & exit to resume later, right-click strike-out of ruled-out options, and keyboard shortcuts.
- **Score Report:** Results lead with a large **PASS / FAIL** and `correct / total` against the pass mark, a four-band readiness scale, a weakest-first exam-domain breakdown that marks study targets, and a **Review your answers** section (All / Missed or blank / Flagged) that lists every option with the correct one and your pick marked, plus an answer-key box that leads with the exam domain, then the explanation and references when available. Manually authored questions without references are supported. **Download summary (PDF)** exports the score, domain breakdown and every question with answers, explanations and domains. **Retake exam** (in the action bar under the score, next to the PDF download) starts a fresh draw from the pool in the same mode. Signed-in learners read the report inside the dashboard with **Exam history** highlighted in the sidebar.
- **Click-to-Start Dashboard:** After login, `/user-dashboard` shows every practice exam the learner owns as a badge with their best and last score and a **Choose a mode** pair — **Exam mode** (timed, primary) or **Practice mode**. One click opens the exam runner directly, resuming an unfinished attempt in that mode. Recent attempts are listed underneath in fixed columns (score, Pass / Fail / In progress, Resume or Review answers), and on phones the sidebar becomes a scrollable tab strip.
- **Exam History:** `/user-dashboard/attempts` (sidebar: *Exam history*) lists every attempt with its score, correct / total, pass result and time used, filterable by certification. Each certification shows best / average / latest score, a score-per-attempt trend against the pass mark, and performance by exam domain across all attempts (domains below the pass mark are tagged *Focus here*). Every row opens the full answer review, and a trash button (with a confirm dialog) lets learners delete any attempt from their history.
- **Light-Blue & Premium Navy Themes:** A compact, chip-free layout with a light-blue light theme by default and an opt-in premium deep-navy dark theme with blue glow accents, Archivo / IBM Plex typography, and an animated hero that previews the exam experience. The exam runner stays a light test-centre screen in both.
- **Support & Lead Capture:** `/p/support` is a lead page — a "free study plan & quote" enquiry form (study plan, Exam Voucher quote, teams & corporate, order help, question feedback), WhatsApp / email / phone cards, a free-teaser offer and self-help links. Enquiries are stored even if email is down, raise an admin notification, email the sales inbox, and are worked at **Admin → Enquiries** (New → Contacted → Closed). Protected by Turnstile, a honeypot, minimum fill time and rate limits.
- **WhatsApp Support Avatar:** A friendly animated support avatar (bottom-right on public pages) opens a quick-question panel that links straight to WhatsApp, with a once-per-visit greeting bubble. Hidden on the exam runner, checkout, and admin pages.
- **Free Teasers:** Guest and authenticated users can take 10 free questions per certification, picked at random from the same domain-weighted pool as the paid exam.
- **Question Types:** Multiple choice, multiple select ("Select TWO answers") and sequencing. CCAO-F sequencing lists each numbered step on a separate line, followed by four A–D order choices (for example, `3, 5, 1, 2, 4`). These single-answer questions appear under the admin **Sequencing** filter and show **Select the correct sequence** in the candidate runner; option ids and scoring remain unchanged.
- **Question Authoring — two modes:** in each question bank, **Add manually** (one form for adding and editing: MCQ, multiple select, true/false and sequencing, with the domain picked from the blueprint and clear validation) or **Generate questions & answers with AI** (the **Generate with AI** button beside Add manually on each question bank page, or on the **AI Question Generator** page in the admin sidebar, opens a pop-up: pick the exam, the number of questions — default 10 — all question types or any of MCQ / Multiple select / Sequencing, and all exam domains or any of them; the AI writes questions, answers and explanations split by blueprint weight). AI questions land as drafts in the **Review queue**, where an admin approves, edits or rejects each one; only approved questions are drawn into attempts. On the Practice Exam page, **Find official page** fills the Exam Info URL from the vendor site (OpenAI web search) and SEO AI Assist writes meta tags. AI calls try **OpenAI → DeepSeek V4.1 Flash → MiniMax M3.1 Flash**, falling through on any failure.
- **Voucher Fulfillment & Invoicing:** Automated invoice minting, voucher inventory management, and scheduled email delivery via background workers.
- **Invoices, Refunds & Credit Notes:** Every paid order gets a sequential GST tax invoice (PDF marked PAID) showing Subtotal (excl. GST), GST 9% (included) and Total (incl. GST), emailed with an order confirmation that lists the same GST breakdown, CC'd to the business. Refunds — through the provider's API or recorded as "already refunded" in the provider dashboard — mint a `CN-` credit note that references the original invoice, email it to the customer, cancel undelivered vouchers and revoke access on a full refund.
- **USD / SGD Prices:** A header currency switcher shows storefront prices in US$ or S$ at the live USD→SGD rate (ECB via Frankfurter, with a fallback feed). Card checkouts still charge USD and show the SGD equivalent; PayNow QR charges SGD at the live rate, snapshotted on the order.
- **Sales Order Alerts:** Each paid order also emails the sales inbox the buyer's name, email, phone, exam title and code, payment method and date.
- **Question Pool Admin:** Each exam's admin page shows the exam % per domain, questions in the pool, and questions drawn per attempt, with editable weights and the official source link.
- **Comprehensive Admin Dashboard:** Manage catalog, orders, users (RBAC), refunds, coupons, API tokens, dynamic settings, and CMS content (FAQ, Banners).
- **Partner API (v1):** Bearer-token endpoints for agents and partner integrations, using tokens minted at `/admin-dashboard/api-tokens` with the `assign:practice-exams` scope. `GET /api/v1/practice-exams?q=` lists assignable practice exams; `GET/POST/DELETE /api/v1/assignments` lists, grants (idempotent `ADMIN_GRANT`) or removes a user's practice-exam access by email — paid access is never touched. A token stops working once its issuing admin is no longer an active admin, and every change is audited as that admin.
- **Sign-in:** `/login` opens on **Email code** (a one-time code by email) with **Password** as the second tab, plus Google, GitHub, Microsoft and LinkedIn (configurable in settings). Admin-created users who sign in with Google skip the set-a-password prompt.
- **Welcome Email:** Admins create a user at **Admin → Users**, grant practice exams on the Entitlements tab, then press **Send welcome email** — the editable **Welcome** template explains how to sign in (Google or email code) and lists the assigned exams.

## Certification Catalog

Tertiary Exams covers **12 vendors** and **195+ practice exams** across cloud, security, networking, data, DevOps, AI, and project-management certifications. Each certification ships with one practice exam drawn from a domain-weighted question pool, sold on its own or with the real-exam voucher.

### Amazon Web Services (AWS)

| Code | Certification | Level |
|---|---|---|
| CLF-C02 | AWS Certified Cloud Practitioner | Foundational |
| AIF-C01 | AWS Certified AI Practitioner | Foundational |
| SAA-C03 | AWS Certified Solutions Architect – Associate | Associate |
| DVA-C02 | AWS Certified Developer – Associate | Associate |
| SOA-C03 | AWS Certified CloudOps Engineer – Associate | Associate |
| DEA-C01 | AWS Certified Data Engineer – Associate | Associate |
| MLA-C01 | AWS Certified Machine Learning Engineer – Associate | Associate |
| SAP-C02 | AWS Certified Solutions Architect – Professional | Professional |
| DOP-C02 | AWS Certified DevOps Engineer – Professional | Professional |
| AIP-C01 | AWS Certified Generative AI Developer – Professional | Professional |
| ANS-C01 | AWS Certified Advanced Networking – Specialty | Specialty |
| SCS-C03 | AWS Certified Security – Specialty | Specialty |

### Microsoft Azure / 365

| Code | Certification | Level |
|---|---|---|
| AZ-900 | Microsoft Azure Fundamentals | Foundational |
| AI-900 | Microsoft Azure AI Fundamentals | Foundational |
| DP-900 | Microsoft Azure Data Fundamentals | Foundational |
| SC-900 | Microsoft Security, Compliance & Identity Fundamentals | Foundational |
| MS-900 | Microsoft 365 Fundamentals | Foundational |
| AZ-104 | Microsoft Azure Administrator | Associate |
| AZ-204 | Developing Solutions for Microsoft Azure | Associate |
| AZ-500 | Microsoft Azure Security Technologies | Associate |
| AI-102 | Microsoft Azure AI Engineer Associate | Associate |
| DP-100 | Microsoft Azure Data Scientist Associate | Associate |
| DP-203 | Microsoft Azure Data Engineer Associate | Associate |
| DP-300 | Microsoft Azure Database Administrator | Associate |
| MD-102 | Microsoft Endpoint Administrator | Associate |
| MS-102 | Microsoft 365 Administrator Expert | Associate |
| PL-300 | Microsoft Power BI Data Analyst | Associate |
| SC-200 | Microsoft Security Operations Analyst | Associate |
| AZ-305 | Designing Microsoft Azure Infrastructure Solutions | Expert |
| AZ-400 | Designing & Implementing Microsoft DevOps Solutions | Expert |

### CompTIA

| Code | Certification | Level |
|---|---|---|
| 220-1101 / 220-1102 | CompTIA A+ (Core 1 & Core 2) | Foundational |
| N10-009 | CompTIA Network+ | Associate |
| SY0-701 | CompTIA Security+ | Associate |
| DA0-001 | CompTIA Data+ | Associate |
| CV0-004 | CompTIA Cloud+ | Associate |
| SK0-005 | CompTIA Server+ | Associate |
| XK0-005 | CompTIA Linux+ | Associate |
| CS0-004 | CompTIA CySA+ (V4) | Professional |
| PK0-005 | CompTIA Project+ | Associate |
| PT0-003 | CompTIA PenTest+ | Advanced |
| CAS-005 | CompTIA SecurityX | Expert |

CompTIA voucher-tier prices track CompTIA's official exam-voucher list price (USD; charged GST inclusive, so the invoice shows the 9% GST within it) — e.g. Security+ / CySA+ / PenTest+ 439, SecurityX 544, Network+/Cloud+/Linux+/Server+/Project+ 399, A+ 274 (per core), Data+ 264.

### Google Cloud

| Code | Certification | Level |
|---|---|---|
| CDL | Google Cloud Digital Leader | Foundational |
| ACE | Google Associate Cloud Engineer | Associate |
| PCA | Google Professional Cloud Architect | Professional |
| PDE | Google Professional Data Engineer | Professional |
| PMLE | Google Professional Machine Learning Engineer | Professional |
| PCSE | Google Professional Cloud Security Engineer | Professional |

### Cisco

| Code | Certification | Level |
|---|---|---|
| 200-201 | Cisco Certified CyberOps Associate (CBROPS) | Associate |
| 200-301 | Cisco Certified Network Associate (CCNA) | Associate |
| 350-401 | Implementing Cisco Enterprise Network Core (ENCOR / CCNP) | Professional |

### Oracle

| Code | Certification | Level |
|---|---|---|
| 1Z0-1085 | Oracle Cloud Infrastructure Foundations Associate | Foundational |
| 1Z0-071 | Oracle Database SQL Certified Associate | Associate |
| 1Z0-1072 | Oracle Cloud Infrastructure Architect Associate | Associate |
| 1Z0-1127 | Oracle Cloud Infrastructure Generative AI Professional | Professional |
| 1Z0-997 | Oracle Cloud Infrastructure Architect Professional | Professional |

### Linux Foundation

| Code | Certification | Level |
|---|---|---|
| CKA | Certified Kubernetes Administrator | Associate |
| CKAD | Certified Kubernetes Application Developer | Associate |

### Other Vendors

| Vendor | Code | Certification | Level |
|---|---|---|---|
| ISC2 | CISSP | Certified Information Systems Security Professional | Associate |
| PMI | PMP | Project Management Professional | Associate |
| Scrum.org | PSM I | Professional Scrum Master I | Associate |
| GitHub | Foundations | GitHub Foundations | Associate |
| Anthropic | CCAR-F | Claude Certified Architect – Foundations (3 practice exams) | Foundational |
| Anthropic | CCAR-P | Claude Certified Architect – Professional | Professional |
| Anthropic | CCDV-F | Claude Certified Developer – Foundations | Foundational |
| Anthropic | CCAO-F | Claude Certified Associate – Foundations (60-question exam + 3 timed 15-question mock exams¹) | Foundational |

¹ CCAO-F mock exams 1–3 are adapted from [CLAUDE-CERTIFICATIONS](https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS) by Amey Thakur (MIT License).

> Additional vendor slugs (AXELOS, IASSC, Tableau) are registered for upcoming catalog expansion.

## Demo

- **Live Site:** [https://exams.tertiaryinfotech.com](https://exams.tertiaryinfotech.com)
- **Catalog:** [https://exams.tertiaryinfotech.com/practice-exams](https://exams.tertiaryinfotech.com/practice-exams)

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS |
| Backend | Node.js, Next.js API Routes |
| Database | PostgreSQL, Prisma ORM |
| Authentication | Auth.js (NextAuth v5 beta), Argon2 |
| Payments | Stripe, PayPal, HitPay, PayNow |
| AI / Integrations | OpenAI SDK (`gpt-6.1-sol` default) with DeepSeek (`deepseek-flash`) and MiniMax (`MiniMax-M3.1-Flash`) fallbacks, Nodemailer, PDF-lib |
| Deployment | Docker, Coolify-ready |

## Architecture

Tertiary Exams uses a monolithic architecture built entirely on the Next.js App Router. It leverages Server Actions for form submissions and Next.js Route Handlers for webhooks, external integrations, and cron workers. Data is persisted in PostgreSQL using Prisma.

```mermaid
flowchart TD
    User[User / Visitor] --> NextUI[Next.js Frontend]
    Admin[Administrator] --> NextUI
    NextUI --> RouteHandlers[Next.js API & Server Actions]
    RouteHandlers --> Prisma[Prisma ORM]
    Prisma --> Postgres[(PostgreSQL Database)]
    RouteHandlers --> Payments[Stripe / PayPal / HitPay]
    RouteHandlers --> Email[Nodemailer / Gmail OAuth]
    RouteHandlers --> AI[OpenAI / DeepSeek / MiniMax]
    Cron[Cron Workers] --> RouteHandlers
```

## Repository Structure

- `prisma/`: Database schema, migrations, and seed scripts.
- `src/app/`: Next.js App Router pages (public marketing, checkout, exam runner, user dashboard, admin dashboard, API routes).
- `src/components/`: Shared UI components for frontend and dense admin data tables.
- `src/lib/`: Core business logic (analytics, invoice generation, payments, AI integration, coupons, settings, etc.).
- `scripts/`: Bulk question seeding, content generation, and utility scripts.
- `.claude/`: Project-specific Claude Code setup — path-scoped rules (`.claude/rules/`: API, payments, exam runtime, questions/seeds, storefront copy, auth/security, schema/deploy), skills (`custom-practice-exam`, `seo-audit`) and agents (`question-bank-generator` — Opus-authored MCQ / multiple-select / sequencing questions per exam domain; `security-scanner` — writes a local Word security assessment to the git-ignored `docs/security/`).
- `public/`: Static assets and logos.
- `docs/`: API spec for partners, PRD, audits and session notes; `docs/images/` holds the README screenshots. Root-level images, decks and scratch output are git-ignored — keep the repo root for config and source only.

## Prerequisites

- **Node.js**: v22+
- **Docker**: For running a local PostgreSQL database and MailHog.
- **Database**: PostgreSQL 16+

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alfredang/ai-exams.git
   cd ai-exams
   ```

2. Install dependencies (requires `--legacy-peer-deps` due to some React 19 incompatibilities):
   ```bash
   npm install --legacy-peer-deps
   ```

3. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```

## Configuration

1. Start the local database and mail server using Docker Compose:
   ```bash
   docker compose up -d postgres mailhog
   ```
   *(Postgres is exposed on port 55432, MailHog on port 8025)*

2. Open the `.env` file and configure the `DATABASE_URL` to point to the local instance (e.g., `postgresql://aiexams:aiexams@127.0.0.1:55432/aiexams?schema=public` — note the host port is **55432**, not the default 5432).

3. Note that most application configuration (Stripe keys, PayPal keys, Auth providers, SEO, Company Info, Email credentials) is managed **at runtime via the Admin Dashboard Settings** rather than environment variables.

## Running Locally

1. Apply database migrations:
   ```bash
   npx prisma db push
   # Or npm run db:migrate if managing dev migrations
   ```

2. Seed the database with the initial admin user and catalog exams:
   ```bash
   npm run db:seed
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev -- -p 3040 -H 127.0.0.1
   ```

4. The application will be available at `http://localhost:3040`.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Generates the Prisma client and builds the Next.js application for production.
- `npm run start`: Starts the Next.js production server.
- `npm run typecheck`: Runs TypeScript compiler check without emitting files. (`npm run lint` is currently broken — the installed Next.js version removed `next lint`; rely on typecheck + build.)
- `npm run db:migrate`: Creates and applies development database migrations.
- `npm run db:deploy`: Applies pending database migrations (for production).
- `npm run db:seed`: Seeds the database with default vendors, exams, products (with their question pools), and admin users.
- `npm run db:studio`: Opens Prisma Studio to visually inspect the database.
- `npm run generate:exam`: CLI question generation (`scripts/generate-questions.ts`) — bulk-author blueprint-aligned questions with Claude outside the admin UI.
- `npm run seed:prod -- <bundle> [expected-exam-slug ...]`: Runs a bundle's idempotent seed endpoint (`POST /api/admin/seed-<bundle>`) on production via `scripts/seed-prod.sh`. Reads `PROD_ADMIN_EMAIL` / `PROD_ADMIN_PASSWORD` from the git-ignored `.env` (never the local `ADMIN_PASSWORD`), verifies the admin session before seeding, and fails if the expected exam slugs are missing (deploy not live yet). See CLAUDE.md → *Seeding a new exam bundle to production*.

## Usage

### User Flow
1. Visit the homepage and browse the `/practice-exams` catalog.
2. Open a certification's Practice Exam page and try the free 10-question teaser.
3. Buy the **Practice Exam** (US$20) or, from its cross-sell or `/exam-vouchers`, the **Exam Voucher** (practice exam included free); sign up, proceed to `/checkout/bundle/[bundleId]?tier=PRACTICE|VOUCHER`, and pay with Stripe, PayPal, or HitPay.
4. After login, `/user-dashboard` shows your practice exams as badges — choose **Exam mode** (timed, the default) or **Practice mode** to go straight into the runner; each attempt is a new domain-weighted draw. `/user-dashboard/attempts` tracks every attempt's score, your trend and your performance by exam domain; use the trash icon on a row to delete an attempt you don't want to keep.
5. Take an attempt at `/exam/[attemptId]` (test-centre style runner), end it from the Review Screen, and read the score report at `/results/[attemptId]` (`?view=missed` / `?view=flagged` filter the answer review; **Retake exam** starts a new attempt).

### Admin Flow
1. Sign in using the seeded admin credentials.
2. Navigate to `/admin-dashboard` to view KPIs and manage the catalog.
3. Go to `/admin-dashboard/settings` to configure Payment Providers, Email Transports, and Social Logins — the **Payment Setup Guide** page there walks through PayPal, HitPay, and Stripe setup with live status checks and webhook URLs.
4. Work sales leads from the Support page at `/admin-dashboard/enquiries` (filter by status and topic; reply by email or WhatsApp, then mark Contacted / Closed).
5. Onboard a learner by hand at `/admin-dashboard/users`: create the account (name + email), grant practice exams on its **Entitlements** tab, then **Send welcome email** (template editable under Settings → Email templates).
6. Set the OpenAI API key (and optionally the model, default `gpt-6.1-sol`) under `/admin-dashboard/settings/credentials`, plus DeepSeek and/or MiniMax keys as fallbacks. In any question bank, use **Add manually** in the Question pool (published straight away) or **Generate questions & answers with AI** at the top of the page. AI questions wait in the **Review queue** until you approve them; edit or reject any you don't want.
7. The `/admin-dashboard/exams` (Question Banks) list shows each bank's total questions (with any drafts called out) and its number of exam domains. Open any question bank to generate, review and browse its whole question pool (`#questions`, filterable by domain, status and type, with bulk Publish / Unpublish / Delete). Each certification's details (exam title, code, duration, pass %, questions per exam, description), exam domains & weights (`#domains`: exam %, pool size, per-attempt draw) and SEO meta are edited on its Practice Exam page (`/admin-dashboard/bundles/[id]`). `/admin-dashboard/bundles` (Practice Exams) lists every Practice Exam (fixed US$20) with its question bank and linked Exam Voucher; `/admin-dashboard/bundles/vouchers` (Exam Vouchers) manages voucher prices, titles, slugs and on-sale status.

## Database

The project uses PostgreSQL with Prisma ORM.

- **Schema:** Defined in `prisma/schema.prisma`.
- **Seeding:** The `prisma/seed.ts` file (run on every deploy) populates vendors, exams, products and admin users, then folds legacy "Practice Exam N" variants into each certification's single question pool and applies the official domain weights (`src/lib/pool-consolidation.ts`). Idempotent.
- **Assigned access:** Team seed cleanup preserves all `ADMIN_GRANT` assignments, including exams outside the default team set, so admin/API assignments survive deployments.
- **Answer order:** New web and mobile attempts shuffle every question's answer options using the attempt id. Retakes can move the same answer to a different position; resuming, reviewing and downloading a report preserve that attempt's order. Sequencing step labels remain fixed while the starting working order is shuffled. Existing attempts keep their historical layouts.
- **Migration:** Run `npm run db:migrate` or `npx prisma db push` to apply schema changes.

## Testing

There is no automated test runner configured in the repository (e.g., Jest/Cypress). 

### Manual Testing
- **Local Dev Server:** Verify functionality manually on the local dev server.
- **E2E Smoke:** Use Playwright MCP for end-to-end smoke testing (homepage, catalog, checkout, login).
- **Email:** Use MailHog at `http://127.0.0.1:8025` to intercept outbound emails.
- **Payments:** Use Stripe/PayPal sandbox credentials for testing checkout flows.

## Deployment

The application is built for deployment on platforms like Vercel or self-hosted Docker environments (Coolify-ready).

### Docker Deployment
The repository includes a multi-stage `Dockerfile` tailored for Next.js standalone output.

1. Ensure environment variables (`NEXTAUTH_URL`, `DATABASE_URL`, `WORKER_SHARED_SECRET`, etc.) are configured in the deployment platform.
2. Build and deploy the Docker image. On boot the container runs `prisma migrate deploy`, then `prisma/seed.ts`, then the server — anything the seed imports must be in the runner image (the Dockerfile copies `src/lib` for this). If a push never shows up live, check the boot log for a seed crash first.
3. Production email is sent from the Gmail account connected in Admin → Settings → Email (currently sales@tertiarycourses.com.sg via Gmail OAuth). Reconnect it there if the mailbox password changes.

## Security

> [!WARNING]
> Existing administrator passwords are never changed by database seeds. Set the
> required password environment variables only when bootstrapping a new account.

- Ensure `NEXTAUTH_SECRET` and `WORKER_SHARED_SECRET` are randomly generated and securely stored.
- Most sensitive keys (Stripe, HitPay, OAuth Client Secrets) are stored encrypted in the `Setting` database table and decrypted at runtime.
- **Sign-up spam protection:** Cloudflare Turnstile CAPTCHA on every email-code request (keys in Admin → Settings → Security), disposable/no-MX email blocking, a honeypot and minimum fill time, failures-only rate limits keyed on the proxy-appended client IP and a normalised email (`+tag` / Gmail dots), and one-time codes that burn after 5 wrong guesses. Mobile sign-up requires an emailed verification code.
- Run the `security-scanner` agent for a static security review; its Word report stays in the git-ignored `docs/security/` folder and must never be uploaded.
- Next.js Route handlers acting as webhooks verify request signatures (e.g., Stripe, HitPay) before processing logic.

## Troubleshooting

- **Database Connection Error:** Ensure Docker is running and the `DATABASE_URL` port matches the exposed port (`55432` by default).
- **Next.js Hydration Errors:** Occur occasionally during development; restart the dev server or verify HTML markup nesting.
- **AI Generation Failing:** Check Admin → Settings → Credentials for at least one valid key (OpenAI, DeepSeek or MiniMax); the error lists each provider's failure. Find official page needs the OpenAI key (web search).
- **New Prisma model returns 500 in dev:** run `npx prisma generate` and restart the dev server — a running server keeps the old client.
- **NPM Install Errors:** Ensure you pass the `--legacy-peer-deps` flag to `npm install` to avoid conflicts with React 19.

## Known Issues

- The runner supports `SINGLE`, `MULTI`, `TRUE_FALSE` and `ORDERING` (sequencing); `HOTSPOT` exists in the schema but is not rendered yet.
- Formal compliance certifications (e.g., GDPR reporting features) are limited to data export requests.
- Role-based Access Control (RBAC) granular roles (Finance, Support, Content) are defined but mostly require strict `ADMIN` enforcement at the API proxy layer.

## Roadmap

- [ ] Define security and privacy acceptance gates before production use.
- [ ] Add automated test coverage for auth, payments, attempts, and admin mutations.
- [ ] Implement front-end support for the `HOTSPOT` question type.
- [ ] Work through the local security assessment (`docs/security/`, not in git): Next.js / next-auth upgrades, session revocation, security headers, PayPal capture checks.
- [ ] Refine proxy permissions to utilize non-admin granular RBAC roles (`FINANCE`, `SUPPORT`, `CONTENT`).

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Please ensure your code passes `npm run typecheck` and `npm run build` before opening a pull request.

## Developed By

**[Tertiary Infotech Academy Pte. Ltd.](https://exams.tertiaryinfotech.com)** — building AI-assisted certification preparation tools.

If you find this project useful, please consider giving it a ⭐ on GitHub.

## License

© Tertiary Infotech Academy Pte. Ltd. All rights reserved.
