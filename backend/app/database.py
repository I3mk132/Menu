"""
Database engine + session management.

Reads DATABASE_URL from the environment (set by docker-compose for
Postgres in production). Falls back to a local SQLite file so the API
can be run and tested without a Postgres server during development.
"""
import os
from sqlalchemy import inspect, text
from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./menu.db",
)

# SQLite needs this connect_arg when used with FastAPI's threaded requests.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


# Columns added after the initial schema. `create_all` only creates missing
# tables — it never alters an existing one — so pre-existing databases need
# these backfilled by hand. Each entry: (table, column, DDL type + default).
_ADDED_COLUMNS = [
    ("tenant", "whatsapp_number", "VARCHAR DEFAULT ''"),
    ("tenant", "order_language", "VARCHAR DEFAULT 'en'"),
]


def _run_migrations() -> None:
    """Add any post-launch columns missing from an existing database.

    Idempotent: inspects live columns first and only issues ALTER TABLE for
    ones that don't exist yet. Works for both SQLite (dev) and Postgres (prod).
    """
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    with engine.begin() as conn:
        for table, column, ddl in _ADDED_COLUMNS:
            if table not in existing_tables:
                continue  # create_all just made it with the column present
            columns = {c["name"] for c in inspector.get_columns(table)}
            if column not in columns:
                conn.execute(text(f'ALTER TABLE {table} ADD COLUMN {column} {ddl}'))


def init_db() -> None:
    """Create all tables. Safe to call on every startup (no-op if they exist)."""
    SQLModel.metadata.create_all(engine)
    _run_migrations()


def get_session():
    """FastAPI dependency that yields a DB session and closes it after use."""
    with Session(engine) as session:
        yield session
