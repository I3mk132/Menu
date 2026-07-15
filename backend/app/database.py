"""
Database engine + session management.

Reads DATABASE_URL from the environment (set by docker-compose for
Postgres in production). Falls back to a local SQLite file so the API
can be run and tested without a Postgres server during development.
"""
import os
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


def init_db() -> None:
    """Create all tables. Safe to call on every startup (no-op if they exist)."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency that yields a DB session and closes it after use."""
    with Session(engine) as session:
        yield session
