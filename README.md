# TrustCore

A clean, offline-capable Progressive Web App (PWA) for a single **ajo** (informal savings group) coordinator in Nigeria. TrustCore helps coordinators register their group, add members, record weekly contributions, track credit profiles, and stay on top of collections — even without an internet connection.

[![Live App](https://img.shields.io/badge/Live%20App-trustcore--savings--buddy.lovable.app-green)](https://trustcore-savings-buddy.lovable.app)
[![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20TypeScript%20%2B%20Tailwind%20%2B%20Supabase-blue)](https://github.com/)

## What it does

- **Coordinator registration & login** — secure 4-digit PIN + phone number authentication
- **Member management** — add members with phone number, occupation, and address
- **Contribution tracking** — record weekly ₦ contributions per member, with real-time balance updates
- **Credit profiles** — visualize payment history, trust score, and reliability; generate a PDF card
- **Dashboard overview** — group summary, total collected, member count, and trust scores
- **Offline-first** — installable PWA that queues edits and contributions while offline and auto-syncs when data returns

## Why it matters

Most Nigerian savings groups still run on paper, WhatsApp, or memory. TrustCore gives coordinators a simple, trustworthy digital ledger that works on cheap phones and poor networks, so no contribution history is lost.

## Tech stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **State & storage:** React Context + localStorage + Supabase
- **Backend / database:** Lovable Cloud (Supabase) — coordinators, members, and contributions tables
- **Offline support:** Vite PWA plugin, Workbox service worker, local mutation queue
- **Charts & PDF:** Recharts + jsPDF
- **Testing:** Vitest + Playwright

## Demo credentials

Use this demo account to explore the app for judges, testers, or stakeholders:

- **Phone:** `08012345678`
- **PIN:** `1234`

Or simply tap the **Demo Login** button on the login screen.

## Getting started locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/trustcore.git
   cd trustcore
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set environment variables**  
   Create a `.env` file with the variables already configured by Lovable Cloud (Supabase URL and anon key). In Lovable these are pre-filled in the project settings.

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:8080](http://localhost:8080) in your browser.

## Building for production

```bash
npm run build
npm run preview
```

The build produces a fully installable PWA with service-worker caching and offline fallbacks.

## Project structure

```
src/
├── components/ui/          # shadcn/ui components
├── lib/                    # Context, offline store, utilities
├── pages/                  # App screens (Auth, Dashboard, Member, etc.)
├── integrations/supabase/  # Supabase client and generated types
├── App.tsx                 # Routing and app shell
└── index.css               # Tailwind / theme tokens
```

## Offline behavior

- All reads are cached locally so the dashboard and member profiles still load without data.
- Adding a member or recording a contribution while offline is stored in a local queue.
- When the device comes back online, queued changes are pushed to Supabase automatically.
- A small banner shows the current connection status.

## Syncing with GitHub

This project is built in [Lovable](https://lovable.dev). To sync it to a GitHub repository:

1. Open the project in the Lovable editor.
2. Click the **Plus (+)** menu in the chat input.
3. Choose **GitHub → Connect project**.
4. Authorize the Lovable GitHub App and select the account/organization.
5. Click **Create Repository** to push the codebase.

After the repo is connected, changes made in Lovable push to GitHub automatically, and changes pushed to GitHub sync back to Lovable.

## License

MIT — feel free to fork, adapt, and build on TrustCore.

---

Built with care for Nigerian savings groups and the coordinators who keep them running.
