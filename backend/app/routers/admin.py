"""
Per-tenant admin endpoints: full CRUD for categories and menu items,
plus image uploads. Scoped by the same tenant-resolution dependency as
the public menu router — the working assumption is that a tenant's own
`/admin` is reached through that tenant's own domain (see the module
docstring in app/dependencies.py).

Everything below `/auth/login` requires a valid bearer token for the
resolved tenant (see app/auth.py::require_tenant_admin) — obtained by
POSTing the tenant's admin password to `/auth/login` first.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlmodel import Session

from app.database import get_session
from app.dependencies import get_current_tenant
from app.models import Tenant
from app import crud
from app.services import storage
from app.auth import require_tenant_admin, verify_password, create_token
from app.schemas import (
    CategoryCreate, CategoryUpdate, CategoryRead,
    MenuItemCreate, MenuItemUpdate, MenuItemRead,
    ImageUploadRead,
    AdminLoginRequest, AdminLoginRead,
)

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


# -------------------------------------------------------------------- Auth
@router.post("/auth/login", response_model=AdminLoginRead)
def login(
    data: AdminLoginRequest,
    tenant: Tenant = Depends(get_current_tenant),
):
    """
    Tenant is resolved the normal way (X-Tenant-Slug / Host header) —
    the password only needs to be correct for *that* tenant, so the
    same password can't be reused to log into a different tenant's
    panel even if it happened to match.
    """
    if not verify_password(data.password, tenant.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return AdminLoginRead(
        access_token=create_token(tenant),
        tenant_slug=tenant.slug,
        tenant_name=tenant.name,
    )


# ---------------------------------------------------------------- Category
@router.get("/categories", response_model=List[CategoryRead])
def list_categories(
    session: Session = Depends(get_session),
    tenant: Tenant = Depends(require_tenant_admin),
):
    return crud.get_categories(session, tenant.id)


@router.post("/categories", response_model=CategoryRead, status_code=201)
def create_category(
    data: CategoryCreate,
    session: Session = Depends(get_session),
    tenant: Tenant = Depends(require_tenant_admin),
):
    return crud.create_category(session, tenant.id, data)


@router.put("/categories/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    session: Session = Depends(get_session),
    tenant: Tenant = Depends(require_tenant_admin),
):
    category = crud.get_category(session, tenant.id, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return crud.update_category(session, category, data)


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    session: Session = Depends(get_session),
    tenant: Tenant = Depends(require_tenant_admin),
):
    category = crud.get_category(session, tenant.id, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    crud.delete_category(session, category)


# ---------------------------------------------------------------- MenuItem
@router.get("/menu-items", response_model=List[MenuItemRead])
def list_menu_items(
    session: Session = Depends(get_session),
    tenant: Tenant = Depends(require_tenant_admin),
):
    return crud.get_menu_items(session, tenant.id, include_unavailable=True)


@router.post("/menu-items", response_model=MenuItemRead, status_code=201)
def create_menu_item(
    data: MenuItemCreate,
    session: Session = Depends(get_session),
    tenant: Tenant = Depends(require_tenant_admin),
):
    category = crud.get_category(session, tenant.id, data.category_id)
    if not category:
        raise HTTPException(status_code=400, detail="category_id does not exist for this tenant")
    return crud.create_menu_item(session, tenant.id, data)


@router.put("/menu-items/{item_id}", response_model=MenuItemRead)
def update_menu_item(
    item_id: int,
    data: MenuItemUpdate,
    session: Session = Depends(get_session),
    tenant: Tenant = Depends(require_tenant_admin),
):
    item = crud.get_menu_item(session, tenant.id, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    if data.category_id is not None and not crud.get_category(session, tenant.id, data.category_id):
        raise HTTPException(status_code=400, detail="category_id does not exist for this tenant")

    # Replacing the image: clean up the old R2 object so switching photos
    # repeatedly doesn't silently accumulate orphaned files in the bucket.
    if data.image_path is not None and item.image_path and data.image_path != item.image_path:
        storage.delete_image(item.image_path)

    return crud.update_menu_item(session, item, data)


@router.delete("/menu-items/{item_id}", status_code=204)
def delete_menu_item(
    item_id: int,
    session: Session = Depends(get_session),
    tenant: Tenant = Depends(require_tenant_admin),
):
    item = crud.get_menu_item(session, tenant.id, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    if item.image_path:
        storage.delete_image(item.image_path)
    crud.delete_menu_item(session, item)


# ---------------------------------------------------------------- Uploads
@router.post("/uploads", response_model=ImageUploadRead, status_code=201)
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Query("menu-items", pattern="^[a-z0-9-]+$"),
    tenant: Tenant = Depends(require_tenant_admin),
):
    """
    Uploads an image to this tenant's Cloudflare R2 prefix and returns
    its path + public URL. The frontend then sends that URL back as
    `image_url` (and the path as `image_path`) on the menu item create
    /update call — this endpoint doesn't touch the database itself, so
    it works equally well for menu item photos as any other image.
    """
    return await storage.upload_image(file, tenant.slug, folder)


@router.delete("/uploads", status_code=204)
def delete_upload(
    path: str = Query(...),
    tenant: Tenant = Depends(require_tenant_admin),
):
    if not path.startswith(f"tenants/{tenant.slug}/"):
        raise HTTPException(status_code=403, detail="Cannot delete another tenant's file")
    storage.delete_image(path)
