# ARENA Project — Step-by-Step Improvement & Hardening Plan

> A pragmatic, phased roadmap to improve architecture, remove redundancy, boost
> speed & UX, make the app deployable on **Vercel** + **Render** free tiers, add
> **real-time notifications & live chat for all users**, and close **security /
> DDoS / NoSQL-injection / rate-limiting / logging** gaps.

**Stack found:** Express 5 + Mongoose + Socket.IO (backend), React 19 + Vite
(rolldown) + Tailwind 4 (frontend). JWT stored in an httpOnly cookie, bcrypt
password hashing. 19 controllers, 19 services, 39 React components.

Each item below is **independent and ordered by risk/impact** so it can be
shipped one PR at a time. Checkboxes let you track progress.

---

## Phase 0 — Triage / Critical Hotfixes (do first, low effort, high impact)

- [ ] **0.1 Stop committing secrets.** `backEnd/.env` is tracked in git.
  - Add `backEnd/.env` and `.env*` to `.gitignore`, run `git rm --cached backEnd/.env`.
  - **Rotate** the leaked `JWT_SECRET` and `MONGO_URI` credentials immediately.
  - Add a committed `backEnd/.env.example` with empty placeholder keys.
- [ ] **0.2 Fix the broken start script.** `package.json` `start` points to
  `node backend/server.js` but the folder is `backEnd/`. Same bug in `Procfile`.
  Fix path casing and the `dev` script (`--prefix frontEnd` should be `client`).
- [ ] **0.3 Remove debug logging that leaks data.** `authController.register`
  logs the raw request body and field map. Strip all `console.log` of bodies /
  emails / tokens. Replace with structured logger (see Phase 5).
- [ ] **0.4 Validate critical env at boot.** Fail fast if `JWT_SECRET`,
  `MONGO_URI`, `CLIENT_URL` are missing (centralize in `config/env.js`).

**Acceptance:** secrets rotated & untracked, `npm start` boots the server, no
PII in logs.

---

## Phase 1 — Security Hardening (highest priority after triage)

### 1.1 Transport & HTTP headers
- [ ] Add **`helmet`** with a sensible CSP, `X-Frame-Options`, HSTS, `noSniff`.
- [ ] Add **`compression`** (gzip/brotli) for JSON & static assets.
- [ ] Behind a proxy (Render/Vercel) set `app.set('trust proxy', 1)` so rate
  limiting & secure cookies see the real client IP / HTTPS.

### 1.2 CORS — allow-list, not single origin
- [ ] Replace `origin: CLIENT_URL || localhost` with an **array allow-list**
  (`CLIENT_URLS` env, comma-split) + a function that rejects unknown origins.
  Mirror the same list in the Socket.IO CORS config.

### 1.3 NoSQL injection (the SQL-injection equivalent for MongoDB)
- [ ] Add **`express-mongo-sanitize`** to strip keys containing `$`/`.` from
  `req.body|query|params`. Today queries like `User.findOne({ email })` accept
  raw user input — a payload `{"email":{"$ne":null}}` could bypass auth.
- [ ] Add **`hpp`** to block HTTP parameter pollution.
- [ ] Audit every `find/findOne/updateOne` that interpolates user input and
  cast IDs with `mongoose.Types.ObjectId.isValid()` before querying.

### 1.4 Input validation everywhere (only 1 file uses it today)
- [ ] Standardize on **`express-validator`** (already a dependency). Create
  `validators/` with schemas per route (auth, players, leagues, tournaments,
  matches, advertisements…) and a shared `validate` middleware that returns 422.
- [ ] Enforce strong password policy + email normalization at registration.

### 1.5 Authentication / token hardening
- [ ] Move cookie flags to env-aware defaults: `httpOnly`, `secure` in prod,
  `sameSite: 'lax'` (cross-site Vercel↔Render needs `'none'` + `secure`).
- [ ] Shorten JWT lifetime (e.g. 15 min access) + add a **refresh token** with
  rotation, OR keep 7d but add a server-side token-version/`tokenInvalidatedAt`
  check so logout/ban truly revokes sessions.
- [ ] Increase bcrypt cost factor to 12; ensure the duplicate `bcrypt` +
  `bcryptjs` deps are consolidated to one.
- [ ] Add a generic auth error ("Invalid credentials") — already mostly done;
  remove the role/allowedRoles debug fields leaked in `authorizeRoles` 403s.

### 1.6 Socket.IO authentication & authorization
- [ ] Sockets are currently **unauthenticated** — anyone can `join-match` and
  `make-move` with any `playerId`. Add a Socket.IO `io.use()` middleware that
  reads the JWT from the cookie/handshake and attaches `socket.user`.
- [ ] In `make-move`, derive `playerId` from `socket.user`, never trust the
  client-supplied id. Verify the user is a participant of that match.

### 1.7 File uploads (multer)
- [ ] Restrict `uploadMiddleWare` with a MIME/extension allow-list, max file
  size, and randomized filenames; store outside web root or on object storage.
- [ ] Never serve user uploads from a path that allows directory traversal.

### 1.8 Dependency & supply-chain hygiene
- [ ] Run `npm audit` in root + `client/`; remove junk/placeholder deps
  (`fs`, `http`, `path` as npm packages do nothing useful and are confusing).
- [ ] Add Dependabot / `npm audit` to CI.

**Acceptance:** `helmet`, CORS allow-list, mongo-sanitize, hpp, validation,
authenticated sockets all in place; `npm audit` shows no high/critical.

---

## Phase 2 — Rate Limiting & DDoS Mitigation

- [ ] **2.1 Global rate limit** with `express-rate-limit` (e.g. 300 req / 15 min
  per IP) mounted before routes.
- [ ] **2.2 Strict auth limiter** on `/api/auth/login` & `/register`
  (e.g. 5–10 / 15 min) to stop credential stuffing / brute force.
- [ ] **2.3 Slow-down** (`express-slow-down`) to add latency past a soft
  threshold instead of hard-blocking legit bursts.
- [ ] **2.4 Body-size caps** — `express.json({ limit: '100kb' })` to stop large
  payload memory-exhaustion attacks.
- [ ] **2.5 Socket throttling** — per-socket event rate limiting on
  `make-move`/chat so a client can't flood the room.
- [ ] **2.6 Edge/network layer** — put the app behind **Cloudflare** (free):
  WAF, bot fight mode, L3/L4 DDoS protection, caching for static assets. This is
  the most effective real DDoS defense; app-level limits handle the rest.
- [ ] **2.7 Distributed limiter store** — since Render/Vercel can scale to
  multiple instances, back rate-limit counters with **Redis**
  (Upstash free tier) so limits are global, not per-instance.

**Acceptance:** login brute-force is blocked, oversized bodies rejected, limits
survive multi-instance via Redis, Cloudflare fronting the domain.

---

## Phase 3 — Architecture Improvements & Redundancy Removal

### 3.1 Standardize the layering
- [ ] Enforce **routes → controllers → services → models** consistently. Some
  services are static classes (`AuthService`), others singletons
  (`notificationService`). Pick one pattern (recommend instance singletons).
- [ ] Introduce a shared **`asyncHandler`** wrapper to kill repetitive
  `try/catch` in every controller and route everything to the global error
  handler.

### 3.2 Centralized error handling & responses
- [ ] Create an `AppError` class + error codes; controllers `throw`, the global
  handler formats `{ status, message, code }`. Removes ~19 copies of identical
  catch blocks.
- [ ] Standardize success responses with a small `respond(res, data, status)`
  helper so the client always sees a consistent envelope.

### 3.3 De-duplicate domain vs schema vs service
- [ ] There are parallel `domains/` and `schemas/` for the same entities
  (`Account`, `Advertiser`, `Match`…). Clarify the boundary: `schemas/` =
  Mongoose models, `domains/` = pure business logic. Remove dead/duplicated
  files and unused game-logic duplicates.
- [ ] Extract shared notification logic (in-app create + email + socket emit)
  into a single `notify(userId, payload)` used everywhere instead of repeated
  `Promise.all` blocks.

### 3.4 Config & constants
- [ ] Single `config/` module for env, DB, CORS, cookie options, roles. Replace
  scattered `process.env.X || default` reads.
- [ ] Move the `Roles` enum to a shared constant imported by both validation and
  auth.

### 3.5 Database performance
- [ ] Add **indexes**: `User.email` (unique already), `Match.status`,
  `Tournament.league`, `InterestGroup.{leagues,games}`, notification `{user,read}`.
- [ ] Replace N+1 patterns in `notificationService` (a `findById` per user in a
  loop) with a single `User.find({ _id: { $in: ids } })`.
- [ ] Use `.lean()` for read-only queries; project only needed fields.

### 3.6 Testing & quality gates
- [ ] Add **Jest + Supertest** for API tests (auth, RBAC, rate limits) and
  Socket.IO tests. Add ESLint to the backend (frontend already has it).
- [ ] Add a GitHub Actions CI: lint → test → `npm audit` → build.

**Acceptance:** controllers are thin, no duplicated try/catch, single
notify/respond/error utilities, indexes added, CI green.

---

## Phase 4 — Speed & UX Improvements

### Frontend
- [ ] **4.1 Code-split** route components with `React.lazy` + `Suspense`; the 39
  components currently ship in one bundle.
- [ ] **4.2 Centralize data fetching** with **TanStack Query** (caching,
  retries, background refetch, loading/error states) instead of raw `fetch` in
  components.
- [ ] **4.3 Fix hardcoded API base.** `apiService.js` hardcodes
  `http://localhost:5000/api`. Use `import.meta.env.VITE_API_BASE` so dev/prod
  differ. Add a Vite dev `proxy` for `/api` to avoid CORS in development.
- [ ] **4.4 Asset/UX polish:** skeleton loaders (you already have
  `LoadingScreen`), optimistic UI for moves/chat, image lazy-loading, route-level
  error boundaries, and a toast system for notifications.
- [ ] **4.5 Build perf:** enable Vite chunk splitting / manualChunks for vendor,
  compress output, and serve with long cache headers + hashed filenames.

### Backend
- [ ] **4.6** `compression` middleware (also listed in 1.1).
- [ ] **4.7** ETag/`Cache-Control` for public read endpoints (leagues,
  tournaments listings) and CDN caching via Cloudflare.
- [ ] **4.8** Connection pooling & `mongoose` `maxPoolSize` tuning for the free
  Mongo tier; add a `/api/health` DB-ping (health route exists, extend it).

**Acceptance:** smaller initial bundle, cached queries, env-driven API base,
faster TTFB on public pages.

---

## Phase 5 — Logging & Observability

- [ ] **5.1 Structured logging** with **`pino`** (or winston) + `pino-http` for
  request logs with request-ids; redact `authorization`, `cookie`, `password`.
- [ ] **5.2 Log levels** by env (debug in dev, info/warn/error in prod). Remove
  all stray `console.log`.
- [ ] **5.3 Error tracking** with **Sentry** (free tier) for backend + frontend;
  capture unhandled rejections (already partially handled — don't `process.exit`
  on every rejection, log & continue where safe).
- [ ] **5.4 Audit log** for sensitive actions (login, role changes, user
  approval, deletions) stored in a collection.
- [ ] **5.5 Metrics/health** — `/api/health` returns uptime + DB status; expose
  basic counters; optionally `/metrics` for uptime monitors (UptimeRobot free).

**Acceptance:** JSON logs with request-ids and redaction, Sentry receiving
errors, audit trail for privileged actions.

---

## Phase 6 — Real-Time Notifications for All Users

> In-app + email notifications already exist server-side, but there is **no
> real-time push and no UI**.

- [ ] **6.1 Per-user socket rooms.** On authenticated socket connect, `join`
  `user-<userId>`. Reuse the auth middleware from 1.6.
- [ ] **6.2 Emit on create.** Extend `notificationService.createNotification`
  to `io.to('user-'+userId).emit('notification', payload)` after save.
- [ ] **6.3 REST for history.** `notificationRoutes` already exists — ensure
  `GET /notifications` (paginated), `PATCH /:id/read`, `POST /read-all`,
  `GET /unread-count`.
- [ ] **6.4 Frontend bell.** Add a notification bell with unread badge, dropdown
  list, mark-as-read, and live updates via the socket; toast on new arrival.
- [ ] **6.5 Preferences.** Per-user channel prefs (in-app/email) + unsubscribe
  links for emails.
- [ ] **6.6 Reliability.** Persist first, emit second; on reconnect the client
  refetches unread so nothing is missed while offline.

**Acceptance:** any logged-in user sees a live unread badge and toast the moment
a relevant notification is created; history is paginated and markable.

---

## Phase 7 — Live Chat for All Users

> No chat exists today. Build it on the existing Socket.IO server.

- [ ] **7.1 Data model.** `Conversation` (participants, type:
  direct|match|league|global) + `Message` (conversation, sender, body,
  createdAt, readBy[]). Index `{ conversation, createdAt }`.
- [ ] **7.2 Socket events (authenticated).** `chat:join`, `chat:message`,
  `chat:typing`, `chat:read`. Server validates membership, persists the message,
  then broadcasts to the room. Sanitize/escape message bodies (XSS) and rate-limit.
- [ ] **7.3 REST history.** `GET /conversations`, `GET /conversations/:id/messages`
  (cursor pagination), `POST /conversations` to start a DM.
- [ ] **7.4 Match & spectator chat.** Reuse `match-<id>` rooms so players +
  spectators can chat during live matches; system messages for moves/results.
- [ ] **7.5 Frontend chat UI.** Conversation list + thread view, typing
  indicators, unread counts, auto-scroll, optimistic send, and a global support
  channel available to **all** users (guests get read-only or a "login to chat"
  prompt).
- [ ] **7.6 Moderation & abuse.** Profanity filter, per-user send rate limit,
  block/report, and operator moderation tools. Message length cap.
- [ ] **7.7 Scale note.** For multi-instance on Render, add the **Socket.IO
  Redis adapter** (`@socket.io/redis-adapter` + Upstash) so rooms/broadcasts
  work across instances. (Free tier likely single instance, but design for it.)

**Acceptance:** authenticated users can DM and chat in match/global rooms in
real time with persistence, typing indicators, unread counts, and basic
moderation.

---

## Phase 8 — Deployment: Vercel (frontend) + Render (backend) Free Tiers

> Recommended split: **frontend (static React) on Vercel**, **backend
> (Express + Socket.IO + Mongo) on Render**. Vercel serverless does NOT support
> long-lived WebSocket connections, so the Socket.IO server must live on Render.

### 8.1 Frontend on Vercel
- [ ] Set Vercel **Root Directory = `client`**, build `npm run build`, output
  `dist`.
- [ ] Add `client/vercel.json` with SPA rewrite (all routes → `/index.html`) and
  asset cache headers.
- [ ] Set env `VITE_API_BASE=https://<render-app>.onrender.com/api` and
  `VITE_SOCKET_URL=https://<render-app>.onrender.com`.

### 8.2 Backend on Render
- [ ] Add `render.yaml` (web service): `rootDir: backEnd`, build `npm install`,
  start `node server.js`, health check `/api/health`, Node 18+.
- [ ] Set env on Render: `MONGO_URI` (MongoDB Atlas free M0), `JWT_SECRET`,
  `CLIENT_URLS=https://<vercel-app>.vercel.app`, `NODE_ENV=production`,
  `PORT` (Render injects it — bind to `process.env.PORT`, already done).
- [ ] `trust proxy` + cookies `sameSite:'none'; secure:true` because the
  frontend (Vercel) and API (Render) are on different domains.
- [ ] Configure Socket.IO CORS to the Vercel origin; client connects to
  `VITE_SOCKET_URL` with `withCredentials: true`.

### 8.3 Free-tier caveats to handle
- [ ] **Render free web services sleep** after 15 min idle (cold starts ~30s).
  Add an UptimeRobot ping to `/api/health` to keep warm, and a frontend
  "waking up" loading state.
- [ ] MongoDB Atlas **M0** has connection limits — keep `maxPoolSize` modest.
- [ ] No persistent disk on free tier → use **Cloudflare R2 / Cloudinary** (free)
  for uploads instead of local `UPLOADS_DIR`.

### 8.4 Alternative single-host option
- [ ] If you prefer one platform: deploy the **whole app on Render** (Express
  already serves `client/dist`). Fix the static path + `start` script and skip
  Vercel. Simpler for WebSockets; keep Vercel only if you want CDN edge for the
  SPA.

**Acceptance:** frontend live on Vercel, API+sockets live on Render, cross-domain
cookies + CORS working, health check green, cold-start UX handled.

---

## Suggested PR Sequence (one concern per PR)

1. PR-0: Secret removal + start-script + env validation (Phase 0)
2. PR-1: helmet/compression/CORS allow-list/mongo-sanitize/hpp (Phase 1.1–1.3)
3. PR-2: Input validation + auth/cookie/token hardening (Phase 1.4–1.5)
4. PR-3: Authenticated sockets + upload hardening (Phase 1.6–1.7)
5. PR-4: Rate limiting + body caps + Redis store (Phase 2)
6. PR-5: asyncHandler + AppError + response helpers + de-dup (Phase 3.1–3.4)
7. PR-6: Indexes + N+1 fixes + tests/CI (Phase 3.5–3.6)
8. PR-7: Frontend code-split + TanStack Query + env API base (Phase 4)
9. PR-8: Structured logging + Sentry + audit log (Phase 5)
10. PR-9: Real-time notifications + bell UI (Phase 6)
11. PR-10: Live chat (model + sockets + UI + moderation) (Phase 7)
12. PR-11: Deployment configs for Vercel + Render (Phase 8)

---

## New Dependencies Introduced (by phase)

- **Backend:** `helmet`, `compression`, `express-rate-limit`, `express-slow-down`,
  `express-mongo-sanitize`, `hpp`, `pino` + `pino-http`, `@sentry/node`,
  `ioredis` + `@socket.io/redis-adapter` (multi-instance), `validator`.
- **Frontend:** `@tanstack/react-query`, a toast lib (e.g. `react-hot-toast`),
  `socket.io-client`, `@sentry/react`.
- **Remove:** placeholder packages `fs`, `http`, `path`; consolidate
  `bcrypt`/`bcryptjs` to one.
