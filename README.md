# Innocent Okiror | Portfolio Website

A fast, single-page personal portfolio for **Innocent Okiror**, a BSc Computer Science student at Mbarara University of Science and Technology (MUST), Uganda, focused on AI, machine learning and Python apps.

**Live site:** https://www.okirorinnocent.tech/

---

## Features

- **Single-file site**: everything (HTML, CSS, JS) lives in `index.html`, with no build step and no framework.
- **Single scrolling page** with Home, Projects, About, Skills, Certificates, Guestbook and Contact sections, a sticky nav that highlights the section you're in, and a mobile menu.
- **Dark / light theme**: follows the device setting on first visit, then remembers the visitor's choice (no flash on load).
- **Mobile menu**, skip-to-content link, keyboard-friendly certificate viewer, and scroll-reveal animations.
- **"More builds" section** for smaller projects (add `l` and `g` links to any entry in the `MORE` array to show buttons).
- **Live GitHub stats**: repo count, stars and languages pulled from the GitHub API.
- **Projects showcase** with responsive cards, screenshot placeholders, GitHub links and accessible detail modals.
- **Learning log, flagship case study and testimonials** driven by arrays in `index.html`.
- **Certificates gallery** with category filter and a lightbox viewer.
- **Guestbook**: visitors leave a note; notes appear after you approve them in `/admin`.
- **Contact form**: Turnstile is verified server-side by an Edge Function before the message is saved, plus direct Gmail and WhatsApp links.
- **Downloadable CV** (`my_cv.pdf`).
- **SEO / sharing ready**: canonical custom-domain URL, Open Graph/Twitter tags, Person JSON-LD and Vercel Analytics.
- **Responsive and accessible**: mobile layout, focus outlines, semantic sections.
- **Security headers** (CSP, HSTS, frame and referrer policies) configured through `vercel.json`.

## Featured Projects

| Project | Category | Summary |
|---|---|---|
| MedSupply Uganda pharmacy marketplace | Healthcare / e-commerce | Marketplace for verified wholesale medicines, pharmacy orders and stock discovery |
| CASMI26 Molecule ID & Mass Spectra Predictor | Machine Learning | Random Forest pipeline over Parquet mass-spectrometry data to predict molecular structures |
| Basel Precipitation Intelligence Platform | Machine Learning | Automated inference platform for high-precision precipitation forecasting |
| Waste sorter image classifier | Computer vision | Browser-based waste classification with Teachable Machine and TensorFlow.js |
| SafeShare | Privacy / security | Offline-first tool for password-protected messages and files, including photo-based sharing |

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
├── supabase/guestbook.sql, admin.sql   # Tables, locked-down policies, admin access
├── supabase/functions/submit/          # Edge Function: Turnstile check + validation + rate limit
├── 404.html, robots.txt, sitemap.xml, og-image.png
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

## Supabase Setup (secure version)

The guestbook and contact form use two tables, but **visitors never write to them directly any more**.
Posts go through an Edge Function that verifies Cloudflare Turnstile **on the server**, validates the
input and rate-limits per network. The browser can only *read approved guestbook notes*.

1. **SQL Editor**: run `supabase/guestbook.sql`, then `supabase/admin.sql`
   (replace `YOUR_ADMIN_USER_UUID` with your admin user's id, in the editor only, never in Git).
2. **Authentication**: create your admin user and turn **off** "Allow new users to sign up".
3. **Edge Function** (needs the [Supabase CLI](https://supabase.com/docs/guides/cli)):
   ```bash
   supabase login
   supabase link --project-ref <project-ref>
   supabase secrets set TURNSTILE_SECRET_KEY=<turnstile secret key> IP_SALT=<long random string>
   supabase functions deploy submit --no-verify-jwt
   ```
   Optional: `supabase secrets set ALLOWED_ORIGINS=https://www.okirorinnocent.tech,https://okirorinnocent.tech`
4. In `index.html`, set your project URL and **publishable (anon) key** in `SB`, and your Turnstile **site key** in `TS_KEY`.
   Only ever use the publishable key in frontend code, never the `service_role` key or the Turnstile secret.
5. Visit `/admin`, sign in and approve guestbook notes (new notes start as *pending*).

Security headers (including a Content-Security-Policy and HSTS) are in `vercel.json`. If you add a new
external script, font or API, add its host to the CSP there or the browser will block it.

## Customize

| What | Where in `index.html` |
|---|---|
| GitHub username for stats | `const GH = "okirorinnocent";` |
| "What I do" statements | the `WHAT` array near the top of the main `<script>` |
| Projects and GitHub URLs | the `PROJECTS` array |
| Learning log | the `LEARNING_LOG` array |
| Testimonials | the `TESTIMONIALS` array |
| Skills cards | the `SKILLS` array |
| Skill levels | the `SKILLS` array (Strong / Working / Learning) |
| Certificates list | the `CERTS` array |
| Theme colors | CSS variables in `:root` and `:root[data-theme=light]` |
| Contact links | Gmail and WhatsApp `href`s in the Contact section |

Project screenshots are WebP files in `project-images/`. Add testimonials to the `TESTIMONIALS` array only when you have real, consented quotes; while it is empty the section is hidden. Certificates: put `certs/<key>-t.jpg` (small thumbnail) and `certs/<key>.pdf` (full file) in `certs/` and list the key in `FULLPDF`. After every deploy that changes files, bump `VERSION` in `sw.js`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Other**. Leave the build command and output directory empty.
4. Click **Deploy**.

`vercel.json` enables clean URLs and adds these headers to every response:

- `Content-Security-Policy` (home and admin pages), `Strict-Transport-Security`
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
