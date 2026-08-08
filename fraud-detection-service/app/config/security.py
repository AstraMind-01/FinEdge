import base64
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from app.config.settings import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()


def get_jwt_key() -> bytes:
    try:
        return base64.b64decode(settings.JWT_SECRET)
    except Exception:
        return settings.JWT_SECRET.encode("utf-8")


def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        key = get_jwt_key()
        # Decode and verify signature using HMAC-SHA256 (HS256 or HS384/HS512)
        payload = jwt.decode(
            token,
            key,
            algorithms=["HS256", "HS384", "HS512"],
            options={"verify_exp": True}
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("JWT verification failed: Token signature has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token signature has expired"
        )
    except jwt.PyJWTError as e:
        logger.warning(f"JWT verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )
