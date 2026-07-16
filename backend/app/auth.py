"""
Auth for each tenant's own /admin panel.

One password per tenant (Tenant.password_hash) — simplest thing that
works for a template where "admin" usually means "the restaurant
owner", not a team of named users. Swap for real per-user accounts if
a tenant ever needs more than one admin identity.

Flow:
  1. POST /api/v1/admin/auth/login with the tenant resolved as usual
     (X-Tenant-Slug / Host, see dependencies.py) + a password.
  2. Password checked against Tenant.password_hash (bcrypt).
  3. On success, a short-lived JWT is issued, scoped to that tenant's id.
  4. Every other /admin/* route requires `Authorization: Bearer <token>`
     and checks the token's tenant_id matches the tenant resolved for
     the request — so a token for tenant A can never touch tenant B's
     data even if both hit the same backend.
"""
import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status

from app.dependencies import get_current_tenant
from app.models import Tenant

# In production, set a real secret via env var. Falls back to a fixed
# dev value so `docker-compose up` works out of the box — change this
# before shipping to real users.
JWT_SECRET = os.getenv("JWT_SECRET", "dev-insecure-secret-change-me")
JWT_ALGORITHM = "HS256"
TOKEN_TTL_HOURS = 12


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        # Malformed/legacy hash — treat as no match rather than 500ing.
        return False


def create_token(tenant: Tenant) -> str:
    payload = {
        "tenant_id": tenant.id,
        "slug": tenant.slug,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def require_tenant_admin(
    request: Request,
    tenant: Tenant = Depends(get_current_tenant),
) -> Tenant:
    """
    Drop-in dependency for admin routes: resolves the tenant as usual,
    then additionally requires a valid bearer token for *that same*
    tenant. Raises 401 on anything wrong (missing header, bad/expired
    token, or a token minted for a different tenant).
    """
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = auth_header.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if payload.get("tenant_id") != tenant.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token does not match this tenant")

    return tenant
