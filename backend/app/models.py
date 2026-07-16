"""
SQLModel table definitions.

Multi-tenancy strategy: Shared-Database, Shared-Schema. Every
tenant-owned table carries an indexed, non-nullable `tenant_id` FK, and
every query in crud.py is scoped by it. See README section on
multi-tenancy for the reasoning and the schema-per-tenant alternative.
"""
from datetime import datetime
from typing import Optional, List, Any
from sqlmodel import SQLModel, Field, Column, JSON


class Tenant(SQLModel, table=True):
    """
    One row per restaurant/cafe using the platform. Resolved per-request
    from the incoming Host header (custom domain) or subdomain (slug) —
    see app/dependencies.py.
    """
    id: Optional[int] = Field(default=None, primary_key=True)

    # Used for subdomain-style routing on the platform's own domain,
    # e.g. slug "menua" -> menua.yoursaas.com
    slug: str = Field(index=True, unique=True)

    # Used for white-labeled custom domains, e.g. "menua.com". Nullable
    # because a tenant may only use the platform subdomain.
    domain: Optional[str] = Field(default=None, index=True, unique=True)

    name: str
    description: str = ""

    # Canonical storage path (R2 object key) + denormalized public URL,
    # for both the logo and favicon. Storing the path lets us delete /
    # replace the underlying object later without re-deriving it.
    logo_path: Optional[str] = None
    logo_url: str = ""
    favicon_path: Optional[str] = None
    favicon_url: str = ""

    primary_color: str = "#6F4E37"
    secondary_color: str = "#C08552"

    # Bcrypt hash of this tenant's own /admin login password. Never
    # serialized to the client (see TenantRead / TenantConfigRead in
    # schemas.py, which both omit it). Nullable so a tenant with no
    # password set simply can't log in until one is assigned.
    password_hash: Optional[str] = None

    contact_email: str = ""
    contact_phone: str = ""
    address: str = ""

    # [{"path": "tenants/menua/gallery/xyz.jpg", "url": "https://..."}, ...]
    gallery_images: List[Any] = Field(default_factory=list, sa_column=Column(JSON))

    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(foreign_key="tenant.id", index=True, nullable=False)

    name_en: str
    name_ar: str
    name_tr: str
    sort_order: int = Field(default=0)


class MenuItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(foreign_key="tenant.id", index=True, nullable=False)
    category_id: int = Field(foreign_key="category.id")

    name_en: str
    name_ar: str
    name_tr: str

    description_en: str = ""
    description_ar: str = ""
    description_tr: str = ""

    price: float
    discounted_price: Optional[float] = None

    # image_path is the R2 object key (e.g. "tenants/menua/menu-items/xyz.jpg"),
    # kept so an image can be deleted/replaced without guessing its key back
    # out of the URL. image_url is what the frontend actually renders.
    image_path: Optional[str] = None
    image_url: str = ""

    is_available: bool = Field(default=True)

    # e.g. [{"name_en": "Small", "name_ar": "صغير", "name_tr": "Küçük", "price_modifier": 0.0}, ...]
    sizes: List[Any] = Field(default_factory=list, sa_column=Column(JSON))
