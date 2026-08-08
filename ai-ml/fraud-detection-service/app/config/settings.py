import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Monorepo root: two levels up from this file (settings.py → config/ → app/ → fraud-detection-service/ → monorepo root)
# fraud-detection-service/ and ml/ are siblings, so ml/artifacts is at monorepo_root/ml/artifacts
_THIS_FILE = Path(__file__).resolve()
_SERVICE_ROOT = _THIS_FILE.parent.parent.parent   # fraud-detection-service/
_DEFAULT_ARTIFACTS_DIR = str((_SERVICE_ROOT / ".." / "ml" / "artifacts").resolve())


class Settings(BaseSettings):
    APP_NAME: str = "fraud-detection-service"
    APP_VERSION: str = "1.0.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8086
    MODEL_VERSION: str = "stub-v0"
    LOG_LEVEL: str = "INFO"
    JWT_SECRET: str = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"

    # Path to the ml/artifacts/ directory produced by Step 12's train_models.py.
    # Resolved at import time relative to THIS file — CWD-independent.
    # Override via ML_ARTIFACTS_DIR env var for Docker volume mounts.
    ML_ARTIFACTS_DIR: str = _DEFAULT_ARTIFACTS_DIR

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()


