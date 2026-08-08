FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing .pyc files & buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ============================================================================
# KNOWN GAP — ML Artifact Packaging (Step 13)
# ============================================================================
# The trained ML model artifacts (ml/artifacts/*.pkl, model_metadata.json)
# live in the sibling ml/ directory of this service in the monorepo.
# They are NOT automatically included in this Docker image because:
#   1. ml/ is outside this service's build context (COPY . . only copies
#      fraud-detection-service/).
#   2. The artifacts can be large (Random Forest ~6MB, XGBoost ~60KB).
#
# Resolution options for a production/Docker deployment:
#   Option A — Volume mount (recommended for development):
#     docker run -v /path/to/repo/ml/artifacts:/ml/artifacts \
#       -e ML_ARTIFACTS_DIR=/ml/artifacts fraud-detection-service
#
#   Option B — Copy artifacts into image at build time (CI/CD):
#     Add to Dockerfile (from repo root build context):
#       COPY ml/artifacts/ /app/ml_artifacts/
#       ENV ML_ARTIFACTS_DIR=/app/ml_artifacts
#
#   Option C — Remote artifact registry (production-grade):
#     Fetch artifacts from S3/GCS/MLflow at container startup.
#
# For this college project demo: the service GRACEFULLY FALLS BACK to
# stub/rule-based scoring if ML_ARTIFACTS_DIR is missing or empty.
# No manual intervention needed — check GET /api/v1/health for modelStatus.
# ============================================================================

EXPOSE 8086

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8086"]
