import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Monorepo root: two levels up from this file
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
    ML_ARTIFACTS_DIR: str = _DEFAULT_ARTIFACTS_DIR

    # Step 22: Supabase PostgreSQL Connection Parameters
    SUPABASE_HOST: str = ""
    SUPABASE_PORT: int = 5432
    SUPABASE_DB: str = "postgres"
    SUPABASE_USER: str = "postgres"
    SUPABASE_PASSWORD: str = ""
    SUPABASE_SCHEMA: str = "fraud_service"

    @property
    def DB_URL(self) -> str:
        if self.SUPABASE_HOST and self.SUPABASE_PASSWORD:
            return f"postgresql://{self.SUPABASE_USER}:{self.SUPABASE_PASSWORD}@{self.SUPABASE_HOST}:{self.SUPABASE_PORT}/{self.SUPABASE_DB}?options=-csearch_path%3D{self.SUPABASE_SCHEMA}"
        return "sqlite:///./fraud_stub.db"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
