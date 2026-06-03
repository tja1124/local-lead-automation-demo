# LeadFlow Demo

A portfolio-ready SaaS demo for **Apex Auto Detailing** — a local lead management and operations platform built to show how small service businesses can capture inquiries, follow up faster, and close more jobs.

![LeadFlow Dashboard](./docs/screenshots/dashboard.png)

> Screenshot placeholder — add a dashboard capture to `docs/screenshots/dashboard.png` for your portfolio.

## Overview

LeadFlow Demo simulates a complete CRM workflow for a local auto detailing business. It includes a dashboard, lead inbox, Kanban pipeline, automations, reviews, and reporting — all running entirely in the browser with **no backend required**.

The app is designed for:

- Portfolio presentations and live walkthroughs
- Demonstrating product thinking for local SMB SaaS
- Showing React + TypeScript UI engineering skills

**Demo business:** Apex Auto Detailing  
**Data persistence:** Browser `localStorage` only  
**Integrations:** None (simulated SMS, email, and analytics)

## Features

### Dashboard
- Business health KPIs (pipeline value, win rate, lead scores)
- Operational priorities and needs-attention widgets
- Deterministic business insights
- Quick CRM actions
- Dismissible demo walkthrough guide

### Leads CRM
- Searchable lead inbox with status filters
- Lead detail panel with customer profile, tasks, and activity timeline
- CRM actions: contact, quote, book, complete, request review
- Lead scoring (0–100) and urgency indicators

### Pipeline Board
- Kanban view across six stages (New → Lost)
- Native drag-and-drop between columns
- Stage selectors and adjacent-stage shortcuts
- Hot lead and overdue visual emphasis

### Automations
- Simulated follow-up workflow library
- Activity feed and automation recommendations

### Reviews
- Simulated Google review request tracking
- Reputation summary and customer review cards

### Reports
- Pipeline, source, and service performance breakdowns
- Executive-style business summary and recommendations

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| State | React hooks + props (no Redux/Zustand) |
| Persistence | localStorage |
| Routing | In-app page state (no React Router) |

## Architecture

```
src/
├── App.tsx              # Page shell + shared state wiring
├── hooks/useLeads.ts    # Leads, activities, tasks, localStorage sync
├── pages/               # Dashboard, Leads, Automations, Reviews, Reports
├── components/          # CRM UI, pipeline board, shared primitives
├── layout/              # Sidebar, header, app shell
├── utils/               # Metrics, scoring, insights, CRM operations
├── types/               # Lead, activity, task, navigation types
└── data/                # Mock leads + navigation config
```

**State flow:** `useLeads` owns lead data, derives tasks from lead status, and persists three localStorage keys:

- `leadflow-demo-leads`
- `leadflow-demo-activities`
- `leadflow-demo-task-completions`

All pages receive shared state via props — changes in the CRM immediately reflect on the Dashboard, Reports, and Reviews views.

## Demo Workflow

Recommended walkthrough for presentations:

1. **Dashboard** — Review business health, priorities, and insights
2. **Leads → Inbox** — Select a lead, review profile, take a CRM action
3. **Leads → Pipeline** — Drag a lead to the next stage
4. **Automations** — Show simulated follow-up workflows
5. **Reports / Reviews** — Highlight business intelligence views
6. **Reset demo data** — Restore the original 13-lead dataset from the Leads page

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production Build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Deployment (Vercel)

This project is a static Vite SPA — deploy directly to Vercel:

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Use default settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Framework preset:** Vite

No environment variables or backend services are required.

## Screenshots

Add portfolio captures to `docs/screenshots/`:

| File | Suggested capture |
|------|-------------------|
| `dashboard.png` | Dashboard with KPIs and insights |
| `pipeline.png` | Pipeline board with lead cards |
| `lead-detail.png` | Lead detail panel with CRM actions |
| `reports.png` | Reports page breakdown charts |

## Project Notes

- All CRM messaging is **simulated** — nothing is sent externally
- Metrics and insights are **computed locally** from lead data
- Designed as a **frontend portfolio piece**, not production software
- Mock data ships with 13 sample leads for Apex Auto Detailing

## License

MIT — free to use for portfolio and learning purposes.
