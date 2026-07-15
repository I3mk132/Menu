"""
Cloudflare R2 storage integration.

R2 exposes an S3-compatible API, so this uses boto3's S3 client pointed
at the R2 account endpoint rather than a Cloudflare-specific SDK. Every
object is written under a tenant-scoped prefix (tenants/{slug}/...) so
storage naturally mirrors the tenant boundary and a tenant's assets can
be listed, audited, or bulk-deleted by prefix alone.

Required env vars (see backend/.env.example):
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
  R2_PUBLIC_BASE_URL  — the public URL the bucket is served from (a R2
                         custom domain, or the bucket's r2.dev URL with
                         public access enabled)
"""
import os
import uuid
import mimetypes
from typing import Optional

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile, HTTPException

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "")
R2_PUBLIC_BASE_URL = os.getenv("R2_PUBLIC_BASE_URL", "").rstrip("/")

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5MB

_client = None


def _is_configured() -> bool:
    return all([R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_BASE_URL])


def get_client():
    global _client
    if _client is None:
        _client = boto3.client(
            "s3",
            endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=R2_ACCESS_KEY_ID,
            aws_secret_access_key=R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
    return _client


async def upload_image(file: UploadFile, tenant_slug: str, folder: str) -> dict:
    """
    Uploads an image to `tenants/{tenant_slug}/{folder}/{uuid}.{ext}` and
    returns {"path": <object key>, "url": <public URL>}.

    Raises HTTPException(400) on invalid input, HTTPException(503) if R2
    isn't configured (e.g. local dev without credentials set), and
    HTTPException(502) if the upload to R2 itself fails.
    """
    if not _is_configured():
        raise HTTPException(
            status_code=503,
            detail="Image storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, "
            "R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_BASE_URL.",
        )

    content_type = file.content_type or mimetypes.guess_type(file.filename or "")[0]
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported image type: {content_type}")

    body = await file.read()
    if len(body) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image exceeds the 5MB upload limit.")

    ext = mimetypes.guess_extension(content_type) or ""
    if ext == ".jpe":
        ext = ".jpg"
    key = f"tenants/{tenant_slug}/{folder}/{uuid.uuid4().hex}{ext}"

    try:
        get_client().put_object(
            Bucket=R2_BUCKET_NAME,
            Key=key,
            Body=body,
            ContentType=content_type,
            CacheControl="public, max-age=31536000, immutable",
        )
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=502, detail=f"Upload to storage failed: {exc}") from exc

    return {"path": key, "url": f"{R2_PUBLIC_BASE_URL}/{key}"}


def delete_image(path: str) -> None:
    """Best-effort delete; swallows storage errors so a stale DB row
    never blocks the admin action that triggered the delete."""
    if not _is_configured() or not path:
        return
    try:
        get_client().delete_object(Bucket=R2_BUCKET_NAME, Key=path)
    except (BotoCoreError, ClientError):
        pass
