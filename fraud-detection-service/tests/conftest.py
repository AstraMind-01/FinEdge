"""
pytest conftest.py — ensures the ML model is loaded before ML-mode tests run.

The issue: FastAPI TestClient created at module level fires on_event("startup")
on the first request. But when test functions directly call model_loader.is_model_loaded()
BEFORE making a request (for the pytest.skip guard), the check runs before startup.

Fix: this session-scoped autouse fixture explicitly calls load_model() once at the
start of the test session, using the same settings.ML_ARTIFACTS_DIR as the app.
"""

import pytest
from app.config.settings import settings
from app.model import model_loader


@pytest.fixture(scope="session", autouse=True)
def ensure_model_loaded():
    """Load ML model once at the start of the test session (if artifacts are present)."""
    if not model_loader.is_model_loaded():
        model_loader.load_model(settings.ML_ARTIFACTS_DIR)
    yield
    # No teardown needed — registry is module-level and lives for the process
