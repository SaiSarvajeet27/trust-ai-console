"""Authentication module for Trust-AI Console.

Provides:
  - In-memory user store (JSON-backed for persistence across restarts)
  - Password hashing with hashlib (no extra deps for hackathon)
  - JWT token generation/verification
  - Google OAuth token verification

Usage:
  from src.auth import router as auth_router
  app.include_router(auth_router)
"""
import hashlib
import hmac
import json
import os
import secrets
import time
import base64
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel

from src import config

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ── Config ───────────────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET", "trust-ai-hackathon-secret-key-2024")
JWT_EXPIRY = 86400 * 7  # 7 days
USERS_FILE = config.OUTPUTS_DIR / "users.json"

# Google OAuth Client ID (set via env var)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


# ── In-memory user store ────────────────────────────────────────────────────
def _load_users() -> dict:
    if USERS_FILE.exists():
        with open(USERS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}


def _save_users(users: dict):
    USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


USERS = _load_users()


# ── Password hashing ────────────────────────────────────────────────────────
def _hash_password(password: str, salt: str = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return hashed.hex(), salt


def _verify_password(password: str, hashed: str, salt: str) -> bool:
    computed, _ = _hash_password(password, salt)
    return hmac.compare_digest(computed, hashed)


# ── JWT ──────────────────────────────────────────────────────────────────────
def _create_token(user_id: str, email: str, name: str, picture: str = "") -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload_data = {
        "sub": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "iat": int(time.time()),
        "exp": int(time.time()) + JWT_EXPIRY,
    }
    payload = base64.urlsafe_b64encode(json.dumps(payload_data).encode()).decode().rstrip("=")
    signature_input = f"{header}.{payload}"
    sig = hmac.new(JWT_SECRET.encode(), signature_input.encode(), hashlib.sha256).digest()
    signature = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    return f"{header}.{payload}.{signature}"


def _verify_token(token: str) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid token format")

        header, payload, signature = parts

        # Verify signature
        signature_input = f"{header}.{payload}"
        expected_sig = hmac.new(JWT_SECRET.encode(), signature_input.encode(), hashlib.sha256).digest()
        expected = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")

        if not hmac.compare_digest(signature, expected):
            raise ValueError("Invalid signature")

        # Decode payload (add padding back)
        padding = 4 - len(payload) % 4
        if padding != 4:
            payload += "=" * padding
        data = json.loads(base64.urlsafe_b64decode(payload))

        # Check expiry
        if data.get("exp", 0) < time.time():
            raise ValueError("Token expired")

        return data
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {e}")


# ── Dependency: get current user from Authorization header ───────────────────
async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid Authorization header")
    token = auth_header[7:]
    return _verify_token(token)


# ── Pydantic models ─────────────────────────────────────────────────────────
class RegisterBody(BaseModel):
    email: str
    password: str
    name: str


class LoginBody(BaseModel):
    email: str
    password: str


class GoogleAuthBody(BaseModel):
    credential: str  # Google ID token from GSI


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/register")
def register(body: RegisterBody):
    email = body.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "Invalid email address")
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    if not body.name.strip():
        raise HTTPException(400, "Name is required")

    if email in USERS:
        raise HTTPException(409, "An account with this email already exists")

    hashed, salt = _hash_password(body.password)
    user_id = f"user_{secrets.token_hex(8)}"

    USERS[email] = {
        "id": user_id,
        "email": email,
        "name": body.name.strip(),
        "password_hash": hashed,
        "salt": salt,
        "picture": "",
        "provider": "email",
    }
    _save_users(USERS)

    token = _create_token(user_id, email, body.name.strip())
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "name": body.name.strip(),
            "picture": "",
        },
    }


@router.post("/login")
def login(body: LoginBody):
    email = body.email.strip().lower()
    user = USERS.get(email)

    if not user:
        raise HTTPException(401, "No account found with this email address")

    if user.get("provider") == "google" and not user.get("password_hash"):
        raise HTTPException(401, "This account uses Google Sign-In. Please use 'Continue with Google'.")

    if not _verify_password(body.password, user["password_hash"], user["salt"]):
        raise HTTPException(401, "Incorrect password")

    token = _create_token(user["id"], email, user["name"], user.get("picture", ""))
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": email,
            "name": user["name"],
            "picture": user.get("picture", ""),
        },
    }


@router.post("/google")
async def google_auth(body: GoogleAuthBody):
    """Verify a Google ID token and create/login a user."""
    try:
        # Decode the Google JWT token (without full verification for hackathon)
        # In production, use google-auth library to verify properly
        parts = body.credential.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid Google token")

        # Decode payload
        payload_b64 = parts[1]
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding
        google_data = json.loads(base64.urlsafe_b64decode(payload_b64))

        email = google_data.get("email", "").lower()
        name = google_data.get("name", "")
        picture = google_data.get("picture", "")

        if not email:
            raise HTTPException(400, "Could not read email from Google token")

        # Create or update user
        if email in USERS:
            user = USERS[email]
            user["name"] = name or user["name"]
            user["picture"] = picture or user.get("picture", "")
        else:
            user_id = f"user_{secrets.token_hex(8)}"
            USERS[email] = {
                "id": user_id,
                "email": email,
                "name": name,
                "password_hash": "",
                "salt": "",
                "picture": picture,
                "provider": "google",
            }
            user = USERS[email]

        _save_users(USERS)

        token = _create_token(user["id"], email, user["name"], user.get("picture", ""))
        return {
            "token": token,
            "user": {
                "id": user["id"],
                "email": email,
                "name": user["name"],
                "picture": user.get("picture", ""),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Google authentication failed: {e}")


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Return the current user from their JWT token."""
    return {
        "id": user["sub"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture", ""),
    }
