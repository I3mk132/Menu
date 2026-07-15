"""
Platform-level tenant management — creating new restaurants on the
platform and managing their branding assets. Distinct from a tenant's
own /admin (which manages that one tenant's menu): this is "your" side
of the SaaS, used to onboard customers.

Gated by require_platform_admin (a shared-secret header check — see
app/dependencies.py for why this is a placeholder, not real auth).
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session

from app.database import get_session
from app.dependencies import require_platform_admin
from app import crud
from app.services import storage
from app.schemas import TenantCreate, TenantUpdate, TenantRead, ImageUploadRead

router = APIRouter(
    prefix="/api/v1/platform/tenants",
    tags=["platform"],
    dependencies=[Depends(require_platform_admin)],
)


@router.get("", response_model=List[TenantRead])
def list_tenants(session: Session = Depends(get_session)):
    return crud.list_tenants(session)


@router.post("", response_model=TenantRead, status_code=201)
def create_tenant(data: TenantCreate, session: Session = Depends(get_session)):
    if crud.get_tenant_by_slug(session, data.slug):
        raise HTTPException(status_code=409, detail="A tenant with this slug already exists")
    if data.domain and crud.get_tenant_by_domain(session, data.domain):
        raise HTTPException(status_code=409, detail="A tenant with this domain already exists")
    return crud.create_tenant(session, data)


@router.get("/{tenant_id}", response_model=TenantRead)
def get_tenant(tenant_id: int, session: Session = Depends(get_session)):
    tenant = crud.get_tenant(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=TenantRead)
def update_tenant(tenant_id: int, data: TenantUpdate, session: Session = Depends(get_session)):
    tenant = crud.get_tenant(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return crud.update_tenant(session, tenant, data)


# ------------------------------------------------------------- Branding
@router.post("/{tenant_id}/branding/logo", response_model=TenantRead)
async def upload_logo(
    tenant_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    tenant = crud.get_tenant(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    if tenant.logo_path:
        storage.delete_image(tenant.logo_path)
    result = await storage.upload_image(file, tenant.slug, "branding")
    return crud.update_tenant(
        session, tenant, TenantUpdate(logo_path=result["path"], logo_url=result["url"])
    )


@router.post("/{tenant_id}/branding/favicon", response_model=TenantRead)
async def upload_favicon(
    tenant_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    tenant = crud.get_tenant(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    if tenant.favicon_path:
        storage.delete_image(tenant.favicon_path)
    result = await storage.upload_image(file, tenant.slug, "branding")
    return crud.update_tenant(
        session, tenant, TenantUpdate(favicon_path=result["path"], favicon_url=result["url"])
    )


@router.post("/{tenant_id}/branding/gallery", response_model=TenantRead)
async def upload_gallery_image(
    tenant_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    tenant = crud.get_tenant(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    result = await storage.upload_image(file, tenant.slug, "gallery")
    updated_gallery = [*tenant.gallery_images, result]
    return crud.update_tenant(session, tenant, TenantUpdate(gallery_images=updated_gallery))


@router.delete("/{tenant_id}/branding/gallery", response_model=TenantRead)
def remove_gallery_image(
    tenant_id: int,
    image: ImageUploadRead,
    session: Session = Depends(get_session),
):
    tenant = crud.get_tenant(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    storage.delete_image(image.path)
    updated_gallery = [g for g in tenant.gallery_images if g.get("path") != image.path]
    return crud.update_tenant(session, tenant, TenantUpdate(gallery_images=updated_gallery))
