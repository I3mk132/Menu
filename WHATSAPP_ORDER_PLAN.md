# WhatsApp Order Feature — Implementation Plan & Progress

Cart → "Order on WhatsApp" button. Opens `wa.me` with a pre-filled order
message. Message language is chosen per-restaurant by the tenant admin.

## Locked decisions
- **Message language**: FIXED to admin's `order_language` (en/ar/tr).
  NOT the customer's current view language.
- **Message detail**: quantity · item name · line total · subtotal.
- **Number**: new dedicated `whatsapp_number` field (not `contact_phone`).
- WhatsApp button hidden when `whatsapp_number` empty.

## Multi-tenancy notes
- Shared-DB, shared-schema. Tenant resolved per-request (Host / X-Tenant-Slug).
- Public config served by `TenantConfigRead` (GET /api/v1/tenant/config).
- Tenant admin auth: bearer token via `require_tenant_admin`.

---

## Progress

### [x] Step 1 — Model fields  (backend/app/models.py)
Added to `Tenant`:
- `whatsapp_number: str = ""`  — E.164 digits, e.g. "905551234567".
- `order_language: str = "en"` — "en" | "ar" | "tr".

### [x] Step 2 — Schemas  (backend/app/schemas.py)
- `TenantConfigRead`: added `whatsapp_number`, `order_language` (public).
- `TenantBase`: added both (defaults "" / "en").
- `TenantUpdate`: added both (Optional).
- New `TenantSettingsRead` (whatsapp_number, order_language).
- New `TenantSettingsUpdate` (both Optional).

### [x] Step 3 — Tenant self-service endpoint  (backend/app/routers/admin.py)
Added, gated by `require_tenant_admin`:
- `GET  /api/v1/admin/settings`  → `TenantSettingsRead`.
- `PUT  /api/v1/admin/settings`  → `TenantSettingsUpdate` → `crud.update_tenant`.
- `order_language` validated against `ORDER_LANGUAGES = {"en","ar","tr"}` (400 else).
- `whatsapp_number` stripped to digits only server-side.
Backend syntax-checked OK.

### [x] Step 4 — Admin Settings tab  (frontend)
- AdminLayout.jsx: added "Settings" tab (admin.settingsTab).
- AdminPage.jsx: imports + renders `<SettingsEditor />` when activeTab==='settings';
  outer loading spinner suppressed on settings tab (editor self-loads).
- New SettingsEditor.jsx: self-loads via adminGetSettings, WhatsApp tel input +
  order_language select (English/العربية/Türkçe), saves via adminUpdateSettings,
  inline saved/error state.
- api.js: added adminGetSettings(), adminUpdateSettings(data).
- i18n: added admin.settingsTab + admin.settings.* to en/ar/tr.

### [x] Step 5 — WhatsApp message builder  (frontend, new file)
`frontend/src/utils/whatsappOrder.js`:
- `buildWhatsappOrderUrl(tenant, lines, subtotal, lineUnitPrice)`.
- Localize item + size names via existing `localized(record, field, tenant.order_language)`
  (utils/localize.js) — force order_language, NOT i18n.language.
- Per line: `{qty}x {name} [({size})] — {formatPrice(unit*qty)}`.
- Footer: subtotal line.
- Template labels (header/subtotal) as small en/ar/tr map keyed by order_language.
- Returns `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`.
- Implemented `buildWhatsappOrderUrl(tenant, lines, subtotal, lineUnitPrice)`;
  LABELS map (header/subtotal) keyed by order_language; returns null when no
  number or empty cart; forces order_language in localized(), not i18n.language.

### [x] Step 6 — Cart button  (frontend/src/components/menu/CartDrawer.jsx)
- tenant via useTenant(); whatsappUrl = buildWhatsappOrderUrl(...).
- Footer block, above Clear button, rendered only when whatsappUrl truthy.
- Primary style + MessageCircle icon; onClick window.open(url,'_blank','noopener,noreferrer').
- i18n key cart.orderWhatsapp added to en/ar/tr.

### [x] Step 7 — Migration  (backend)
- database.py: `_run_migrations()` runs after `create_all` in `init_db()`.
  Inspects live columns, ALTER TABLE ADD COLUMN only for missing ones
  (whatsapp_number VARCHAR DEFAULT '', order_language VARCHAR DEFAULT 'en').
  Idempotent; works SQLite + Postgres. Tested against a simulated old DB.
- seed.py: added whatsapp_number + order_language to both demo tenants so the
  button shows in seeded demos.

---

## Files touched (reference)
- backend/app/models.py                          (done)
- backend/app/schemas.py                          (done)
- backend/app/routers/admin.py                    (step 3)
- backend/app/database.py                          (step 7, inspect)
- backend/seed.py                                  (step 7, maybe)
- frontend/src/services/api.js                     (step 4)
- frontend/src/components/admin/AdminLayout.jsx    (step 4)
- frontend/src/pages/AdminPage.jsx                 (step 4)
- frontend/src/components/admin/SettingsEditor.jsx (step 4, new)
- frontend/src/utils/whatsappOrder.js              (step 5, new)
- frontend/src/components/menu/CartDrawer.jsx      (step 6)
- frontend/src/i18n/{en,ar,tr}.json                (steps 4 & 6)
