"""
Public tenant configuration endpoint. This is the very first API call
the frontend makes on page load (see frontend/src/branding/loadBranding.js)
— it's what makes the same static build serve completely different
branding depending on which domain it's accessed from.
"""
from fastapi import APIRouter, Depends

from app.dependencies import get_current_tenant
from app.models import Tenant
from app.schemas import TenantConfigRead

router = APIRouter(prefix="/api/v1/tenant", tags=["tenant"])


@router.get("/config", response_model=TenantConfigRead)
def get_tenant_config(tenant: Tenant = Depends(get_current_tenant)):
    return tenant
