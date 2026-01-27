# Crypton

> A hardened, server-rendered cybersecurity blog with a secret-path admin panel, RBAC, 2FA, and full TR/EN internationalization.

Crypton is a personal **cybersecurity blog** for publishing articles, technical write-ups, and analyses on topics like web security, network security, malware, and CTF challenges. Readers get a fast, clean reading experience, while you manage everything — posts, categories, media, and comments — from a private admin panel. Security is built in from the ground up, so your blog stays locked down without extra setup.

## 🚀 Features

- **Content management**: Markdown posts (EasyMDE editor), categories, tags, cover images, and a media library with automatic WebP conversion + resizing (`sharp`).
- **Full-text search**: Turkish-friendly `$text` search over title/summary/content/tags, plus tag and category filter pages.
- **Authentication & RBAC**: argon2id hashing (legacy bcrypt auto-upgraded on login), three roles (`admin` / `editor` / `author`) with per-resource ownership, and forced password change on first login.
- **Two-factor auth (2FA)**: optional per-user TOTP (`speakeasy` + QR code) with single-use, hashed backup/recovery codes.
- **Hardened security**: Helmet CSP with per-request nonce, session-synced CSRF (constant-time compare), session fingerprinting, rate limiting, contact-form honeypot, and `sanitize-html` on rendered Markdown.
- **Internationalization (i18n)**: complete TR/EN UI for both the public site and admin panel, with a one-click navbar language switch and session persistence.
- **SEO & syndication**: meta/Open Graph/JSON-LD tags, canonical URLs, RSS feed, sitemap, and robots.txt.
- **Operations**: audit log with CSV/JSON export, per-post view tracking, traffic dashboard, and structured logging (`pino`).
- **Reading experience**: table of contents, reading-progress bar, code syntax highlighting, related posts, and a moderated comment system.

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| **Backend** | Node.js (≥18), Express 4 |
| **Frontend** | EJS server-side templates, vanilla JS, custom CSS (dark theme) |
| **Database** | MongoDB with Mongoose 8 (`connect-mongo` session store) |
| **Security** | argon2 / bcrypt, Helmet (CSP), speakeasy (TOTP), express-rate-limit, sanitize-html, express-validator |
| **Media & Content** | sharp (image processing), multer (uploads), marked (Markdown), EasyMDE |
| **Tooling / DevOps** | Docker, Docker Compose, pino (logging), nodemon |

## 📦 Installation

### Prerequisites

- Node.js ≥ 18
- MongoDB (local instance) — or use the bundled Docker setup
- Docker & Docker Compose (optional, recommended)

### 1. Clone & install

```bash
git clone https://github.com/batuhanmeral/Crypton.git
cd crypton
npm install
```

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
# Application
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/crypton

# Session — REQUIRED in production (process exits if left default)
SESSION_SECRET=a-long-random-hard-to-guess-string

# Hide the admin login behind a secret slug -> /admin/<slug>
ADMIN_LOGIN_PATH=secret-entry

# Optional: persistent uploads directory ($DATA_PATH/uploads)
DATA_PATH=/var/data

# Public site URL (RSS / sitemap / canonical / Open Graph)
SITE_URL=https://your-domain.com

# 2FA issuer label shown in authenticator apps
TOTP_ISSUER=Crypton
```

### 3. Run

```bash
npm run dev     # development (nodemon, :3000)
npm start       # production (NODE_ENV=production)
```

### Run with Docker (app + MongoDB)

```bash
docker compose up -d --build
```

Compose provisions MongoDB 7 with a healthcheck and persistent volumes (`mongo-data`, `uploads`), and overrides `MONGODB_URI` so the app reaches the `mongo` service on the compose network.

## 💡 Usage

### Create the first admin

On a fresh database, bootstrap an admin account (run it again with the same username to reset the password):

```bash
npm run create-admin -- <username> <password>

# inside Docker:
docker compose exec app npm run create-admin -- <username> <password>
```

Then sign in to the admin panel at the secret path you set in `ADMIN_LOGIN_PATH`:

```text
http://localhost:3000/admin/secret-entry
```

> Additional users are created from the admin panel (**Users** section), which is restricted to the `admin` role. Each role sees only the panels it is allowed to use.

### Common operations

```bash
npm run create-admin -- <user> <pass>  # Create (or reset the password of) an admin account
npm run migrate:roles                  # Backfill roles / password algo / post ownership
```

### Public routes

| Route | Description |
| --- | --- |
| `GET /` | Home (latest posts) |
| `GET /blog?q=<term>` | Full-text search |
| `GET /tag/:tag` · `GET /category/:slug` | Filtered lists |
| `GET /blog/:id` | Post detail |
| `POST /blog/:id/comments` | Submit a comment (rate-limited, moderated) |
| `GET /rss.xml` · `/sitemap.xml` · `/robots.txt` | SEO endpoints |

### Roles & permissions

| Capability | admin | editor | author |
| --- | :---: | :---: | :---: |
| Manage own posts / media | ✓ | ✓ | ✓ |
| Manage **all** posts / media | ✓ | ✓ | — |
| Categories & contact messages | ✓ | ✓ | — |
| Users & audit log | ✓ | — | — |

## 📸 Screenshots

| Home | Dashboard | Articles |
| :---: | :---: | :---: |
| ![Home](docs/home.png) | ![Dashboard](docs/dashboard.png) | ![Articles](docs/articles.png) |

## 📄 License

Released under the [MIT License](LICENSE). © 2026 Batuhan Meral.
