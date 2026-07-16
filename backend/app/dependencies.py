"""
Resolves which tenant a request belongs to, so every router can depend
on `get_current_tenant` and stay completely unaware of the routing
mechanics below.

Resolution order:
  1. `X-Tenant-Slug` header — explicit override. Used by the frontend in
     local development (VITE_TENANT_SLUG) and by API tooling (Swagger,
     Postman) where there's no real per-tenant domain to test against.
  2. Host header exact match against `Tenant.domain` — the white-label
     path: the tenant's own custom domain (e.g. menuA.com) points at
     this backend, and the Host header alone identifies the tenant.
  3. Host header first label match against `Tenant.slug` — the
     platform-subdomain path (e.g. menua.yoursaas.com).
  4. Dev fallback — if nothing matched and TENANT_DEV_FALLBACK=true
     (the default in this template), fall back to the first active
     tenant so `docker-compose up` works immediately without DNS setup.
     NEVER enable this in a real multi-tenant production deployment —
     it would resolve any unmapped domain to tenant #1.

IMPORTANT: this identifies which tenant's *data* to serve, not who is
*authorized* to edit it. There's no auth layer in this template yet —
the admin routes are scoped by the same tenant resolution as the public
routes, on the assumption that each tenant's `/admin` is reached via
that tenant's own domain. Add real authentication (a login page, JWTs,
session cookies — whatever fits) before shipping this to real users.
"""
import os
from fastapi import Depends, HTTPException, Request
from fastapi import Header, status
from sqlmodel import Session

from app.database import get_session
from app import crud
from app.models import Tenant

DEV_FALLBACK = os.getenv("TENANT_DEV_FALLBACK", "true").lower() == "true"


def get_current_tenant(request: Request, session: Session = Depends(get_session)) -> Tenant:
    tenant: Tenant | None = None

    slug_override = request.headers.get("x-tenant-slug")
    if slug_override:
        tenant = crud.get_tenant_by_slug(session, slug_override.strip().lower())

    if not tenant:
        host = request.headers.get("host", "").split(":")[0].lower()
        if host:
            tenant = crud.get_tenant_by_domain(session, host)
            if not tenant and "." in host:
                subdomain = host.split(".")[0]
                tenant = crud.get_tenant_by_slug(session, subdomain)

    if not tenant and DEV_FALLBACK:
        tenant = crud.get_first_active_tenant(session)

    if not tenant or not tenant.is_active:
        raise HTTPException(status_code=404, detail="No tenant found for this domain.")

    return tenant


PLATFORM_ADMIN_KEY = os.getenv("PLATFORM_ADMIN_KEY", "")


def require_platform_admin(request: Request) -> None:
    """
    Guards the platform-level tenant-management endpoints (create/edit
    tenants) — separate from any individual tenant's own /admin.

    This is a minimal shared-secret check, not a real auth system: it's
    enough to keep the tenant-onboarding endpoints from being wide open
    in a template, but a production platform should replace this with
    real authenticated accounts (staff login, SSO, etc.). Fails closed
    if PLATFORM_ADMIN_KEY isn't set, so it can't be silently bypassed by
    forgetting to configure it.
    """
    if not PLATFORM_ADMIN_KEY:
        raise HTTPException(status_code=503, detail="Platform admin access is not configured.")
    provided = request.headers.get("x-platform-admin-key", "")
    if provided != PLATFORM_ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing platform admin key.")
