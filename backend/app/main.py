import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import menu, admin, tenant, platform

app = FastAPI(
    title="Restaurant Menu SaaS API",
    description="Multi-tenant backend API for the Restaurant/Cafe Menu Template.",
    version="2.0.0",
)

# Tenants live on arbitrary custom domains, so origins default to "*".
# Restrict them with CORS_ORIGINS (comma-separated) once the tenant
# domains are known. Credentials stay disabled: admin auth is a Bearer
# token in the Authorization header, never a cookie, so the browser has
# no ambient credentials for a foreign origin to ride on.
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
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
