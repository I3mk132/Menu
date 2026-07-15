from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import menu, admin, tenant, platform

app = FastAPI(
    title="Restaurant Menu SaaS API",
    description="Multi-tenant backend API for the Restaurant/Cafe Menu Template.",
    version="2.0.0",
)

# Wide-open CORS by default since tenants can be on arbitrary custom
# domains and we can't know them ahead of time in a template. Consider
# validating Origin against the resolved tenant's `domain` field instead
# of "*" once you have a real list of tenants to check against.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tenant.router)
app.include_router(menu.router)
app.include_router(admin.router)
app.include_router(platform.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/v1/health", tags=["health"])
def health_check():
    return {"status": "ok"}
