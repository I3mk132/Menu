"""
Read / Create / Update schemas.

These are kept separate from the table models (app.models) so the API
never accidentally exposes or accepts fields it shouldn't — notably,
`tenant_id` is never client-writable. It's always inferred server-side
from the resolved tenant (see app/dependencies.py) and stamped onto the
row in crud.py, never taken from the request body.
"""
from datetime import datetime
from typing import Optional, List, Any
from sqlmodel import SQLModel


# ------------------------------------------------------------------ Tenant
class TenantConfigRead(SQLModel):
    """Public payload for GET /api/v1/tenant/config — everything the
    frontend's branding loader needs and nothing more (no internal ids,
    no is_active flag)."""
    slug: str
    name: str
    description: str
    logo_url: str
    favicon_url: str
    primary_color: str
    secondary_color: str
    contact_email: str
    contact_phone: str
    address: str
    gallery_images: List[Any] = []


class TenantBase(SQLModel):
    slug: str
    domain: Optional[str] = None
    name: str
    description: str = ""
    logo_url: str = ""
    favicon_url: str = ""
    primary_color: str = "#6F4E37"
    secondary_color: str = "#C08552"
    contact_email: str = ""
    contact_phone: str = ""
    address: str = ""
    gallery_images: List[Any] = []
    is_active: bool = True


class TenantCreate(TenantBase):
    pass


class TenantUpdate(SQLModel):
    slug: Optional[str] = None
    domain: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    logo_path: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_path: Optional[str] = None
    favicon_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    gallery_images: Optional[List[Any]] = None
    is_active: Optional[bool] = None


class TenantRead(TenantBase):
    id: int
    logo_path: Optional[str] = None
    favicon_path: Optional[str] = None
    created_at: datetime


# ---------------------------------------------------------------- Category
class CategoryBase(SQLModel):
    name_en: str
    name_ar: str
    name_tr: str
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(SQLModel):
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    name_tr: Optional[str] = None
    sort_order: Optional[int] = None


class CategoryRead(CategoryBase):
    id: int
    tenant_id: int


# ---------------------------------------------------------------- MenuItem
class SizeOption(SQLModel):
    name_en: str
    name_ar: str
    name_tr: str
    price_modifier: float = 0.0


class MenuItemBase(SQLModel):
    category_id: int
    name_en: str
    name_ar: str
    name_tr: str
    description_en: str = ""
    description_ar: str = ""
    description_tr: str = ""
    price: float
    discounted_price: Optional[float] = None
    image_url: str = ""
    is_available: bool = True
    sizes: List[Any] = []


class MenuItemCreate(MenuItemBase):
    image_path: Optional[str] = None


class MenuItemUpdate(SQLModel):
    category_id: Optional[int] = None
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    name_tr: Optional[str] = None
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    description_tr: Optional[str] = None
    price: Optional[float] = None
    discounted_price: Optional[float] = None
    image_path: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    sizes: Optional[List[Any]] = None


class MenuItemRead(MenuItemBase):
    id: int
    tenant_id: int
    image_path: Optional[str] = None


# ---------------------------------------------------------------- Uploads
class ImageUploadRead(SQLModel):
    path: str
    url: str
