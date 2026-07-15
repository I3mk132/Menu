#!/bin/sh
set -e

echo "Waiting for the database to be ready..."
python - <<'PY'
import os
import time
import sys

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

url = os.getenv("DATABASE_URL", "sqlite:///./menu.db")
engine = create_engine(url)

for attempt in range(30):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database is ready.")
        sys.exit(0)
    except OperationalError:
        print(f"Database not ready yet (attempt {attempt + 1}/30)...")
        time.sleep(2)

print("Database never became ready.")
sys.exit(1)
PY

echo "Ensuring demo data exists (seed.py only inserts if no tenants exist)..."
python - <<'PY'
from sqlmodel import Session, select
from app.database import engine, init_db
from app.models import Tenant

init_db()
with Session(engine) as session:
    has_data = session.exec(select(Tenant)).first() is not None

if not has_data:
    import seed
    seed.run()
else:
    print("Existing tenant data found — skipping seed.")
PY

echo "Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8080
