"""
Plain data-access functions. Kept free of HTTP concerns (status codes,
etc.) so they stay easy to unit test and reuse between routers.

Every Category/MenuItem function takes a tenant (or tenant_id) and
filters or stamps it accordingly — there is intentionally no code path
in here that can read or write another tenant's rows.
"""
from typing import Optional, List
from sqlmodel import Session, select

from app.models import Tenant, Category, MenuItem
from app.schemas import (
    TenantCreate, TenantUpdate,
    CategoryCreate, CategoryUpdate,
    MenuItemCreate, MenuItemUpdate,
)
import bcrypt


def _hash_password(password: str) -> str:
    # Duplicated (rather than imported) from app.auth to avoid a circular
    # import: app.auth -> app.dependencies -> app.crud.
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# ------------------------------------------------------------------ Tenant
def get_tenant_by_slug(session: Session, slug: str) -> Optional[Tenant]:
    return session.exec(select(Tenant).where(Tenant.slug == slug)).first()


def get_tenant_by_domain(session: Session, domain: str) -> Optional[Tenant]:
    return session.exec(select(Tenant).where(Tenant.domain == domain)).first()


def get_first_active_tenant(session: Session) -> Optional[Tenant]:
    return session.exec(select(Tenant).where(Tenant.is_active == True).order_by(Tenant.id)).first()  # noqa: E712


def get_tenant(session: Session, tenant_id: int) -> Optional[Tenant]:
    return session.get(Tenant, tenant_id)


def list_tenants(session: Session) -> List[Tenant]:
    return session.exec(select(Tenant).order_by(Tenant.id)).all()


def create_tenant(session: Session, data: TenantCreate) -> Tenant:
    payload = data.model_dump(exclude={"password"})
    tenant = Tenant(**payload, password_hash=_hash_password(data.password))
    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    return tenant


def update_tenant(session: Session, tenant: Tenant, data: TenantUpdate) -> Tenant:
    updates = data.model_dump(exclude_unset=True, exclude={"password"})
    for key, value in updates.items():
        setattr(tenant, key, value)
    if data.password:
        tenant.password_hash = _hash_password(data.password)
    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    return tenant


# ---------------------------------------------------------------- Category
def get_categories(session: Session, tenant_id: int) -> List[Category]:
    return session.exec(
        select(Category).where(Category.tenant_id == tenant_id).order_by(Category.sort_order)
    ).all()


def get_category(session: Session, tenant_id: int, category_id: int) -> Optional[Category]:
    category = session.get(Category, category_id)
    if category and category.tenant_id == tenant_id:
        return category
    return None


def create_category(session: Session, tenant_id: int, data: CategoryCreate) -> Category:
    category = Category.model_validate(data, update={"tenant_id": tenant_id})
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def update_category(session: Session, category: Category, data: CategoryUpdate) -> Category:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(category, key, value)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def delete_category(session: Session, category: Category) -> None:
    session.delete(category)
    session.commit()


# ---------------------------------------------------------------- MenuItem
def get_menu_items(
    session: Session,
    tenant_id: int,
    category_id: Optional[int] = None,
    include_unavailable: bool = True,
) -> List[MenuItem]:
    query = select(MenuItem).where(MenuItem.tenant_id == tenant_id)
    if category_id is not None:
        query = query.where(MenuItem.category_id == category_id)
    if not include_unavailable:
        query = query.where(MenuItem.is_available == True)  # noqa: E712
    return session.exec(query).all()


def get_menu_item(session: Session, tenant_id: int, item_id: int) -> Optional[MenuItem]:
    item = session.get(MenuItem, item_id)
    if item and item.tenant_id == tenant_id:
        return item
    return None


def create_menu_item(session: Session, tenant_id: int, data: MenuItemCreate) -> MenuItem:
    item = MenuItem.model_validate(data, update={"tenant_id": tenant_id})
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def update_menu_item(session: Session, item: MenuItem, data: MenuItemUpdate) -> MenuItem:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(item, key, value)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete_menu_item(session: Session, item: MenuItem) -> None:
    session.delete(item)
    session.commit()
