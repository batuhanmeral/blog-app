# Crypton

> A hardened, server-rendered cybersecurity-themed blog with a secret-path admin panel, RBAC, 2FA, and full TR/EN internationalization.

Crypton is a personal **cybersecurity-themed blog** for publishing articles, technical write-ups, and analyses on topics like web security, network security, malware, and CTF challenges. Readers get a fast, clean reading experience, while you manage everything — posts, categories, media, and comments — from a private admin panel. Security is built in from the ground up, so your blog stays locked down without extra setup.

## Features

- **Write & publish**: a Markdown editor with categories, tags, cover images, and a built-in media library.
- **Search & browse**: fast full-text search with dedicated tag and category pages.
- **Team roles**: admin, editor, and author accounts — everyone sees and manages only what they're allowed to.
- **Two-factor login (2FA)**: optional extra security with an authenticator app and backup codes.
- **Secure by default**: nonce-based CSP, CSRF protection, rate-limited logins, spam-resistant forms, and sanitized user content.
- **Dark & light theme**: one-click theme switch that's remembered across visits.
- **Bilingual (TR / EN)**: switch the whole site and admin panel between Turkish and English instantly.
- **SEO ready**: clean meta tags, shareable link previews, an RSS feed, and a sitemap.
- **Insights**: a traffic dashboard, post view counts, and an activity log.
- **Pleasant reading**: table of contents, reading-progress bar, code highlighting, related posts, and comments.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Backend** | Node.js (≥18), Express 4 |
| **Frontend** | EJS server-side templates, vanilla JS, custom CSS (dark theme) |
| **Database** | MongoDB with Mongoose 8 (`connect-mongo` session store) |
| **Security** | argon2 / bcrypt, Helmet (CSP), speakeasy (TOTP), express-rate-limit, sanitize-html, express-validator |
| **Media & Content** | sharp (image processing), multer (uploads), marked (Markdown), EasyMDE |
| **Tooling / DevOps** | Docker, Docker Compose, pino (logging), nodemon |

## Installation

Requires Node.js ≥ 18 and MongoDB (or just use Docker).

```bash
git clone https://github.com/batuhanmeral/Crypton.git
cd crypton
npm install
cp .env.example .env   # fill in your values — see .env.example for all options
npm run dev            # http://localhost:3000 (npm start for production)
```

Or run everything (app + MongoDB) with Docker:

```bash
docker compose up -d --build
```

## Screenshots

<p align="center">
  <strong>Home Page</strong><br/>
  <img src="docs/home.png" alt="Home" width="850"/>
  <br/><br/>
  <strong>Admin Dashboard</strong><br/>
  <img src="docs/dashboard.png" alt="Dashboard" width="850"/>
  <br/><br/>
  <strong>Articles Management</strong><br/>
  <img src="docs/articles.png" alt="Articles" width="850"/>
</p>

## License

Released under the [MIT License](LICENSE). © 2026 Batuhan Meral.
