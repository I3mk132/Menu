# Architecture & Operations Guide

Technical deep-dive for the Restaurant Menu SaaS. See the [README](../README.md) for an overview and setup.

## 1. Multi-Tenant Architecture

**Approach: shared database, shared schema.** Every tenant-owned table
(`Category`, `MenuItem`) carries an indexed, non-nullable `tenant_id`
foreign key, and every query in `crud.py` is scoped by it — there's no
code path that can read or write across tenants. This was chosen over
schema-per-tenant because the expected shape of this business (many
small-to-medium restaurants, each with a few dozen rows of data) favors
operational simplicity: one migration path, one connection pool, easy
cross-tenant reporting later if you want it. Schema-per-tenant is worth
revisiting only if you land enterprise tenants who contractually require
hard data isolation — at that point it's a per-tenant decision, not a
platform-wide rewrite, since the `tenant_id` column already establishes
the boundary logically.

**How a request finds its tenant** (`app/dependencies.py`,
`get_current_tenant`), in order:

1. `X-Tenant-Slug` header — explicit override, used by the frontend in
   local dev and by API tooling (Swagger, Postman, curl).
2. `Host` header exact match against `Tenant.domain` — the real
   white-label path: the tenant's own custom domain points at this
   backend, and the Host header alone identifies them.
3. `Host` header's first label matched against `Tenant.slug` — the
   platform-subdomain path (`menua.yoursaas.com`).
4. Dev fallback — if `TENANT_DEV_FALLBACK=true` (the default), falls back
   to the first active tenant so the stack works immediately without DNS.
   **Turn this off before a real multi-tenant launch** — otherwise any
   unmapped domain silently resolves to tenant #1.

**Admin routes use the same resolution as public routes**, plus
authentication: each tenant has its own admin password (bcrypt-hashed in
`Tenant.password_hash`). `POST /api/v1/admin/auth/login` returns a JWT
that is scoped to that tenant, and every other `/admin/*` route requires
it as `Authorization: Bearer <token>`. A token issued for one tenant is
rejected on another tenant's domain.

**Onboarding new tenants** is a separate, platform-level concern from any
individual tenant's admin panel — see `routers/platform.py`:

```bash
# All platform endpoints require X-Platform-Admin-Key (set PLATFORM_ADMIN_KEY
# in backend/.env — see backend/.env.example). This is a shared-secret check,
# not real auth; replace it with staff accounts before this is a real business.

curl -X POST http://localhost:8000/api/v1/platform/tenants \
  -H "X-Platform-Admin-Key: $PLATFORM_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "menu-b",
    "domain": "menub.com",
    "name": "Menu B Bistro",
    "primary_color": "#2E7D32",
    "secondary_color": "#F9A825"
  }'
```

Logo, favicon, and gallery images are uploaded per-tenant separately:

```bash
curl -X POST http://localhost:8000/api/v1/platform/tenants/3/branding/logo \
  -H "X-Platform-Admin-Key: $PLATFORM_ADMIN_KEY" \
  -F "file=@logo.png"
```

---

## 2. Image Uploads (Cloudflare R2)

Menu item photos are uploaded straight from the admin panel
(`ImageUploadField.jsx` → `POST /api/v1/admin/uploads`) and stored in R2
under a tenant-scoped key: `tenants/{slug}/{folder}/{uuid}.{ext}`. The
database stores both the object **path** (so it can be deleted or replaced
later without guessing the key back out of a URL) and the resolved public
**url** (what the frontend actually renders).

To connect a real bucket, fill in `backend/.env` (see
`backend/.env.example`):

```bash
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_BASE_URL=https://your-bucket.your-account.r2.dev   # or a custom domain
```

Create the API token and bucket from the Cloudflare dashboard (R2 → Manage
API Tokens), and either enable the bucket's public `r2.dev` URL or attach a
custom domain to it — R2 buckets aren't publicly readable by default.
Without these set, upload requests return a clean `503` instead of
crashing, so the rest of the app still works during setup.

Max upload size is 5MB; allowed types are jpeg/png/webp/gif/avif — both
enforced server-side in `app/services/storage.py`, not just in the UI.

---

## 3. White-Labeling & the Branding Loader

`GET /api/v1/tenant/config` is the one public endpoint every page load
depends on. It returns everything needed to brand the page for whichever
tenant the request resolved to: name, description, logo/favicon URLs,
primary/secondary colors, contact info, and gallery images.

`frontend/src/branding/loadBranding.js` calls it **before the React app
mounts** (from `main.jsx`) and applies document title, meta description,
and favicon directly, so there's no flash of default branding on first
paint. The fetched tenant object is then passed into `<TenantProvider>` as
its initial value — no second network round trip once components mount.

Brand *colors* are applied separately, inside `ThemeContext`, not the
branding loader — deliberately. `ThemeContext` owns the three style
presets (Warm Cafe / Modern Fast Food / Luxury Dining), which set fonts,
corner radius, and shadow as well as a default palette. On every theme
change it re-applies the preset's variables and then layers the tenant's
`primary_color` / `secondary_color` on top as CSS custom properties
(`--color-primary`, `--color-accent`). That split is what lets a
restaurant pick both a *shape* (preset) and a *brand color* (tenant
config) independently, instead of the two fighting over who last wrote
the CSS variable.

To add a new style preset, see `frontend/src/styles/themes.js` — adding
one entry there is enough, no component code changes.

---

## 4. Connecting a Tenant's Custom Domain

This template only handles the application-level part (resolving a
request's `Host` header to a tenant row). The infrastructure side —
actually pointing `menub.com` at your servers — depends on your hosting
setup, but broadly:

1. The tenant points their domain's DNS (A/CNAME) at your load
   balancer/reverse proxy.
2. Your reverse proxy (nginx, Caddy, a cloud load balancer, Cloudflare
   itself) terminates TLS for that domain and forwards to this backend/
   frontend, unchanged, keeping the original `Host` header intact.
3. Set `Tenant.domain = "menub.com"` via the platform API (section 1) — after
   that, any request arriving with that Host header resolves to this
   tenant automatically, no backend deploy required.

If you're fronting everything with Cloudflare already (likely, given R2),
Cloudflare for SaaS (`cloudflare.com/products/cloudflare-for-saas/`) is
built for exactly this — provisioning TLS per tenant custom domain without
you managing certificates yourself.

---

## 5. Adding a Language

1. Duplicate `frontend/src/i18n/en.json` and translate the values.
2. Register it in `frontend/src/i18n/index.js` (`resources` and
   `supportedLngs`).
3. Add it to the `LANGUAGES` array in `LanguageSwitcher.jsx`.
4. If the language is right-to-left, add its code to `RTL_LANGUAGES` in
   `frontend/src/i18n/index.js`.

Menu content itself (category and item names/descriptions) is stored
per-language directly on each row (`name_en`, `name_ar`, `name_tr`, ...),
editable from the admin panel's language tabs.
