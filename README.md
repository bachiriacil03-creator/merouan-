# ✈ Flight Ticket Booking Landing Page

A modern, production-ready flight booking landing page with Supabase integration, Algerian wilaya autocomplete, and a full glassmorphism UI.

---

## Tech Stack

- **Frontend:** HTML5, CSS3 (custom properties + glassmorphism), Vanilla JS (ES6)
- **Database:** Supabase (PostgreSQL via REST API — no SDK dependency)
- **Design:** Glassmorphism · Mobile-first · Scroll animations · Accessible

---

## Prerequisites

- A [Supabase](https://supabase.com) project (free tier is fine)
- Any static file server or direct browser open (no build step required)

---

## Setup Instructions

### 1. Create the Supabase table

In your Supabase project → **SQL Editor**, run:

```sql
create table booked (
  id            uuid primary key default gen_random_uuid(),
  first_name    text not null,
  family_name   text not null,
  date_of_birth date not null,
  email         text not null,
  phone         text not null,
  wilaya        text not null,
  created_at    timestamptz default now()
);

-- Allow public inserts (anon key)
alter table booked enable row level security;
create policy "Allow anonymous inserts" on booked
  for insert to anon with check (true);
```

### 2. Configure credentials

Open `js/config.js` and replace the placeholder values:

```js
const SUPABASE_URL      = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

Find these in: Supabase Dashboard → **Settings → API**.

### 3. Customise branding

Still in `js/config.js`:

```js
const BRAND = {
  companyName: "YourAgencyName",
  tagline:     "Your tagline here",
  logoText:    "YA",               // initials shown as fallback
  logoImage:   "../assets/logo.png", // set to "" to use text initials
};
```

Replace `assets/logo.png` with your own logo (recommended: 80×80 px PNG).

### 4. Run the site

Open `index.html` directly in a browser, or serve with any static server:

```bash
# Python 3
python -m http.server 8080

# Node (npx)
npx serve .
```

Then visit `http://localhost:8080`.

---

## Environment Variables

| Variable | Where to find | Required |
|---|---|---|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key | ✅ |

---

## Folder Structure

```
flight-booking/
├── index.html          ← Single-page landing
├── css/
│   └── style.css       ← All styles (glassmorphism, responsive)
├── js/
│   ├── config.js       ← ⚙️  Branding + Supabase credentials (edit this)
│   └── app.js          ← Wilaya autocomplete, validation, form submit
├── assets/
│   ├── logo.png        ← Replace with your logo
│   └── images/         ← Additional assets
└── README.md
```

---

## Features

- **Glassmorphism UI** — frosted-glass cards, blurred backgrounds, smooth gradients
- **58 Algerian Wilayas** — searchable autocomplete with keyboard navigation
- **Real-time validation** — per-field error/success states with ARIA live regions
- **Supabase integration** — direct REST API insert, no SDK bundle needed
- **Responsive** — fully mobile-first, tested from 320 px up
- **Accessible** — semantic HTML, ARIA roles, keyboard-navigable, reduced-motion respected
- **Editable branding** — one config file controls name, tagline, and logo everywhere
"# merouan-" 
