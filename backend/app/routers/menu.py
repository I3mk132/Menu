"""
Public, read-only endpoints consumed by the customer-facing menu.
Every query is scoped to the tenant resolved from the request's domain
(see app/dependencies.py) — a request against menuA.com can never see
menuB's categories or items. Only available items are returned here;
hidden/unavailable items only show up through the admin router.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.database import get_session
from app.dependencies import get_current_tenant
from app.models import Tenant
from app import crud
from app.schemas import CategoryRead, MenuItemRead

router = APIRouter(prefix="/api/v1", tags=["menu"])


@router.get("/categories", response_model=List[CategoryRead])
def list_categories(
    session: Session = Depends(get_session),
    tenant: Tenant = Depends(get_current_tenant),
):
    return crud.get_categories(session, tenant.id)


@router.get("/menu-items", response_model=List[MenuItemRead])
def list_menu_items(
    category_id: Optional[int] = None,
    session: Session = Depends(get_session),
    tenant: Tenant = Depends(get_current_tenant),
):
    return crud.get_menu_items(session, tenant.id, category_id=category_id, include_unavailable=False)


@router.get("/menu-items/{item_id}", response_model=MenuItemRead)
def get_menu_item(
    item_id: int,
    session: Session = Depends(get_session),
    tenant: Tenant = Depends(get_current_tenant),
):
    item = crud.get_menu_item(session, tenant.id, item_id)
    if not item or not item.is_available:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item
