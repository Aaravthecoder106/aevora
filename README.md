# AEVORA // FORGE

> The Proof-of-Work Community & Collaborative Workspace for Hardware & AI Builders.

Zero vaporware. Zero marketing slides. An uncompromising engineering workshop where builders log serial console outputs, logic analyzer traces, quantized on-device models, collaborate on real silicon, and compete in build sprints.

---

## ⚡ Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism, Framer Motion
- **Auth & Database**: Supabase (PostgreSQL, Row Level Security, Triggers)
- **AI Idea Engine**: Gemini API (`/api/generate-idea`)

---

## 🛠️ Modules & Capabilities
- **Live Ship Feed & Forums**: Real-time proofs, telemetry logs, serial outputs, and threaded peer reviews.
- **Project Showcase & Team Collab**: List projects and recruit collaborators for open roles.
- **Sprints & Challenges**: Timed hardware & AI build sprints with live countdowns and submission tracking.
- **Blueprint Library & Curated Resources**: Verified starter schematics, CAD files, AI boilerplates, and grants.
- **AI Idea & Spec Generator**: Domain-specific hardware/AI architecture generator with BOM and 7-day roadmaps.
- **Monthly Leaderboards**: Dynamic builder rankings based on shipping streaks, XP, and verified proofs.
- **Builder Dashboard**: Personal telemetry, streak tracking, saved specs, and collab applications.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Aaravthecoder106/aevora.git
cd aevora
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Setup Database Schema
Run the SQL migration script located in `/supabase/schema.sql` inside your Supabase project's SQL Editor to set up all tables, RLS policies, and triggers.

### 4. Run the Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the workspace.
