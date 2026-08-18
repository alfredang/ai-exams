<div align="center">

# Tertiary Exams

[![Live](https://img.shields.io/badge/Live-exams.tertiaryinfotech.com-6d28d9?style=flat-square)](https://exams.tertiaryinfotech.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Claude](https://img.shields.io/badge/AI-Claude-d97757?style=flat-square&logo=anthropic)](https://www.anthropic.com)
[![Download on the App Store](https://img.shields.io/badge/Download_on_the-App_Store-0D96F6?style=flat-square&logo=apple)](https://apps.apple.com/us/app/tertiary-ai-exams/id6781995308)

**Practice smarter for your next certification.**

[Live Site](https://exams.tertiaryinfotech.com) · [Catalog](https://exams.tertiaryinfotech.com/practice-exams) · [iOS App](https://apps.apple.com/us/app/tertiary-ai-exams/id6781995308)

<a href="https://apps.apple.com/us/app/tertiary-ai-exams/id6781995308">
  <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" alt="Download Tertiary AI Exams on the App Store" height="48" />
</a>

</div>

Tertiary Exams is a full-stack certification practice-exam platform designed for commercial training and certification-preparation providers. It allows users to browse certification bundles, take free teaser attempts, purchase practice exams and real-exam vouchers, and take timed or practice-mode exams with detailed result breakdowns. The platform includes a robust admin backend with AI-assisted question generation, dynamic e-commerce features (Stripe, PayPal, HitPay, PayNow), invoicing, and voucher fulfillment.

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

Tertiary Exams is built to provide an end-to-end e-commerce and exam-taking experience. It solves the problem of managing certification preparation platforms by bundling practice exams and optional real-exam vouchers into unified e-commerce products. The platform is designed for scalable content generation using Claude AI and Firecrawl, enabling administrators to quickly author and maintain a large library of high-quality, blueprint-aligned practice questions.

**Current Status:** The core application features, checkout flows, exam runners, and admin dashboards are implemented and functioning.

## Screenshot

![Screenshot](screenshot.png)

## Features

- **Public Catalog:** Browse certification vendors, levels, and exam bundles with search and pagination.
- **Bundle-based Commerce:** Purchase multi-variant practice exams and optional real-exam vouchers as a single product.
- **Multiple Payment Gateways:** Checkout support for Stripe, PayPal, HitPay, and PayNow with promo codes, billing addresses, and an integrated tax (GST) engine. An in-admin **Payment Setup Guide** documents provider configuration step by step with live status checks.
- **Exam Runner:** Timed exam mode and practice mode with a sticky progress header, per-answer autosave, question flagging, keyboard navigation, a pre-submit review screen, and detailed post-exam result breakdowns with explanations and reference links.
- **Free Teasers:** Guest and authenticated users can take 10 free teaser questions per exam.
- **AI-Assisted Question Authoring:** Generate blueprint-aligned questions using Claude AI and Firecrawl via manual input, blueprints, PDFs, or web scraping.
- **Voucher Fulfillment & Invoicing:** Automated invoice minting, voucher inventory management, and scheduled email delivery via background workers.
- **Comprehensive Admin Dashboard:** Manage catalog, orders, users (RBAC), refunds, coupons, API tokens, dynamic settings, and CMS content (FAQ, Banners).
- **Social Login:** Authenticate via Password, OTP, Google, GitHub, Microsoft, and LinkedIn (configurable in settings).

## Certification Catalog

Tertiary Exams covers **12 vendors** and **195+ practice exams** across cloud, security, networking, data, DevOps, AI, and project-management certifications. Each certification ships with one or more numbered practice exams (P1, P2, …) plus optional real-exam voucher bundles.

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
| Anthropic | CCA-F | Claude Certified Architect – Foundations | Foundational |

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
| AI / Integrations | Claude Agent SDK, Firecrawl API, Nodemailer, PDF-lib |
| Deployment | Docker, Coolify-ready |

## Architecture

ExamNova uses a monolithic architecture built entirely on the Next.js App Router. It leverages Server Actions for form submissions and Next.js Route Handlers for webhooks, external integrations, and cron workers. Data is persisted in PostgreSQL using Prisma.

```mermaid
flowchart TD
    User[User / Visitor] --> NextUI[Next.js Frontend]
    Admin[Administrator] --> NextUI
    NextUI --> RouteHandlers[Next.js API & Server Actions]
    RouteHandlers --> Prisma[Prisma ORM]
    Prisma --> Postgres[(PostgreSQL Database)]
    RouteHandlers --> Payments[Stripe / PayPal / HitPay]
    RouteHandlers --> Email[Nodemailer / Gmail OAuth]
    RouteHandlers --> AI[Claude / Firecrawl API]
    Cron[Cron Workers] --> RouteHandlers
```

## Repository Structure

- `prisma/`: Database schema, migrations, and seed scripts.
- `src/app/`: Next.js App Router pages (public marketing, checkout, exam runner, user dashboard, admin dashboard, API routes).
- `src/components/`: Shared UI components for frontend and dense admin data tables.
- `src/lib/`: Core business logic (analytics, invoice generation, payments, AI integration, coupons, settings, etc.).
- `scripts/`: Bulk question seeding, content generation, and utility scripts.
- `.claude/`: Project-specific Claude AI agent and skill instructions.
- `public/`: Static assets and logos.

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
- `npm run db:seed`: Seeds the database with default vendors, exams, bundles, and admin users.
- `npm run db:studio`: Opens Prisma Studio to visually inspect the database.
- `npm run generate:exam`: CLI question generation (`scripts/generate-questions.ts`) — bulk-author blueprint-aligned questions with Claude outside the admin UI.

## Usage

### User Flow
1. Visit the homepage and browse the `/practice-exams` catalog.
2. Select a bundle and try a free teaser attempt.
3. Sign up, proceed to `/checkout/bundle/[bundleId]`, and complete the payment using Stripe, PayPal, or HitPay.
4. Navigate to `/user-dashboard` to view purchased exams, vouchers, and start practice attempts.

### Admin Flow
1. Sign in using the seeded admin credentials.
2. Navigate to `/admin-dashboard` to view KPIs and manage the catalog.
3. Go to `/admin-dashboard/settings` to configure Payment Providers, Email Transports, and Social Logins — the **Payment Setup Guide** page there walks through PayPal, HitPay, and Stripe setup with live status checks and webhook URLs.
4. Go to `/admin-dashboard/exams/[id]/author` to generate new exam questions using the AI integration.

## Database

The project uses PostgreSQL with Prisma ORM.

- **Schema:** Defined in `prisma/schema.prisma`.
- **Seeding:** The `prisma/seed.ts` file populates the database with initial vendor data, multi-variant exam bundles, and admin user credentials.
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
2. Build and deploy the Docker image. The container will automatically run `prisma migrate deploy` before starting the server.

## Security

> [!WARNING]
> Ensure you update default admin passwords provided in the seed script (`password123`) before deploying to production.

- Ensure `NEXTAUTH_SECRET` and `WORKER_SHARED_SECRET` are randomly generated and securely stored.
- Most sensitive keys (Stripe, HitPay, OAuth Client Secrets) are stored encrypted in the `Setting` database table and decrypted at runtime.
- Next.js Route handlers acting as webhooks verify request signatures (e.g., Stripe, HitPay) before processing logic.

## Troubleshooting

- **Database Connection Error:** Ensure Docker is running and the `DATABASE_URL` port matches the exposed port (`55432` by default).
- **Next.js Hydration Errors:** Occur occasionally during development; restart the dev server or verify HTML markup nesting.
- **AI Generation Failing:** Check the Admin Dashboard Settings to ensure a valid `ANTHROPIC_API_KEY` and `FIRECRAWL_API_KEY` are provided.
- **NPM Install Errors:** Ensure you pass the `--legacy-peer-deps` flag to `npm install` to avoid conflicts with React 19.

## Known Issues

- The runner UI currently only supports `SINGLE`, `MULTI`, and `TRUE_FALSE` questions, despite the database schema supporting `ORDERING` and `HOTSPOT`.
- Formal compliance certifications (e.g., GDPR reporting features) are limited to data export requests.
- Role-based Access Control (RBAC) granular roles (Finance, Support, Content) are defined but mostly require strict `ADMIN` enforcement at the API proxy layer.

## Roadmap

- [ ] Define security and privacy acceptance gates before production use.
- [ ] Add automated test coverage for auth, payments, attempts, and admin mutations.
- [ ] Implement front-end support for `ORDERING` and `HOTSPOT` question types.
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
