# Innocent Okiror | Portfolio Website

A fast, single-page personal portfolio for **Innocent Okiror**, a BSc Computer Science student at Mbarara University of Science and Technology (MUST), Uganda, focused on AI, machine learning and Python apps.

**Live site:** https://pro-nine-ruddy.vercel.app/

---

## Features

- **Single-file site**: everything (HTML, CSS, JS) lives in `index.html`, with no build step and no framework.
- **Single scrolling page** with Home, Projects, About, Skills, Certificates, Guestbook and Contact sections, a sticky nav that highlights the section you're in, and a mobile menu.
- **Dark / light theme**: follows the device setting on first visit, then remembers the visitor's choice (no flash on load).
- **Mobile menu**, skip-to-content link, keyboard-friendly certificate viewer, and scroll-reveal animations.
- **"More builds" section** for smaller projects (add `l` and `g` links to any entry in the `MORE` array to show buttons).
- **Live GitHub stats**: repo count, stars and languages pulled from the GitHub API.
- **Projects showcase** with category tags and tech chips.
- **Certificates gallery** with category filter and a lightbox viewer.
- **Guestbook**: visitors can leave a message (stored in Supabase).
- **Contact form**: messages are saved to Supabase, plus direct Gmail and WhatsApp links.
- **Downloadable CV** (`my_cv.pdf`).
- **SEO / sharing ready**: meta description and Open Graph tags (`profile.png` as the preview image).
- **Responsive and accessible**: mobile layout, focus outlines, semantic sections.
- **Security headers** configured through `vercel.json`.

## Featured Projects

| Project | Category | Summary |
|---|---|---|
| OKIROR'S AI: Intelligent Workspace Companion | Artificial Intelligence | Dark-themed conversational assistant powered by Google Gemini with customizable persona instructions |
| Weather Prediction ML Pipeline | Machine Learning | Streamlit app that loads trained `.pkl` models with Joblib for forecasts and feature inference |
| CASMI26 Molecule ID & Mass Spectra Predictor | Machine Learning | Random Forest pipeline over Parquet mass-spectrometry data to predict SMILES molecular structures |

## Tech Stack

- **Frontend:** HTML5, CSS3 (custom properties for theming), vanilla JavaScript
- **Fonts:** Inter (Google Fonts)
- **Backend (BaaS):** [Supabase](https://supabase.com) REST API for the guestbook and contact form
- **Data:** GitHub REST API (public, unauthenticated)
- **Hosting:** [Vercel](https://vercel.com)

## Project Structure

```
.
├── index.html      # The entire site (markup, styles, scripts)
├── vercel.json     # Clean URLs + security headers
├── sw.js, pwa.js, manifest.webmanifest, icons/   # Installable PWA
├── supabase/guestbook.sql   # Guestbook table policies and grants
├── my_cv.pdf       # CV, served by the "Download CV" button
├── profile.png     # Portrait on the Home page and Open Graph image
├── school.png      # Photo collage in the About section
└── certs/          # Certificate images/PDFs for the gallery (add yours here)
```

> The Certificates page looks for files in `certs/` named after each certificate (for example `certs/<name>.jpg`, with a `-t.jpg` thumbnail variant). Add your certificate files there.

## Run Locally

No install needed. Any static server works:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node
npx serve .
```

Then open `http://localhost:8000`.

## Supabase Setup

The guestbook and contact form need two tables.

```sql
create table guestbook (
  id bigint generated always as identity primary key,
  name text not null,
  message text not null,
  approved boolean default true,
  created_at timestamptz default now()
);

create table contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table guestbook enable row level security;
alter table contact_messages enable row level security;

-- Guestbook: anyone can post; only approved messages are readable
create policy "guestbook read"   on guestbook for select using (approved = true);
create policy "guestbook insert" on guestbook for insert with check (true);

-- Contact: anyone can send, but nobody can read from the browser
create policy "contact insert" on contact_messages for insert with check (true);
```

Also run the grants in `supabase/guestbook.sql` (without them posting fails with HTTP 401 / 42501).

Then, in `index.html`, set your project URL and **publishable (anon) key**:

```js
const SB = { url: "https://<project-ref>.supabase.co", key: "<publishable-or-anon-key>" };
```

**Important:** only ever use the publishable/anon key in frontend code, never the `service_role` key. Row Level Security is what protects your data, so keep the policies above (or stricter) enabled.

## Customize

| What | Where in `index.html` |
|---|---|
| GitHub username for stats | `const GH = "okirorinnocent";` |
| "What I do" statements | the `WHAT` array near the top of the main `<script>` |
| Skills cards | the `SKILLS` array |
| Skill levels | the `SKILLS` array (Strong / Working / Learning) |
| Certificates list | the `CERTS` array |
| Theme colors | CSS variables in `:root` and `:root[data-theme=light]` |
| Contact links | Gmail and WhatsApp `href`s in the Contact section |

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Other**. Leave the build command and output directory empty.
4. Click **Deploy**.

`vercel.json` enables clean URLs and adds these headers to every response:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Contact

- **Email:** okirorinnocent49@gmail.com
- **GitHub:** [@okirorinnocent](https://github.com/okirorinnocent)
- **LinkedIn:** [innocent-okiror](https://www.linkedin.com/in/innocent-okiror-2793443b0)

## License

© 2026 Innocent Okiror. All rights reserved. The code is shared for viewing and learning; please don't copy the personal content, photos or CV without permission.
