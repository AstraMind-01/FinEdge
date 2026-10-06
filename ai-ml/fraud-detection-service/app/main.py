import logging
from fastapi import FastAPI
from app.api.routes import router
from app.config.settings import settings
from app.model.model_loader import load_model
from app.middleware.correlation import CorrelationIdMiddleware, CorrelationIdLogFilter

class CorrelationIdFormatter(logging.Formatter):
    def format(self, record):
        if not hasattr(record, "correlationId"):
            record.correlationId = "none"
        return super().format(record)

log_filter = CorrelationIdLogFilter()
formatter = CorrelationIdFormatter(
    "%(asctime)s [cid=%(correlationId)s] %(levelname)s %(name)s - %(message)s"
)
handler = logging.StreamHandler()
handler.setFormatter(formatter)

root_logger = logging.getLogger()
root_logger.handlers = [handler]
root_logger.setLevel(settings.LOG_LEVEL)
root_logger.addFilter(log_filter)

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="FinEdge AI Fraud Detection Microservice — ML-powered (Step 13)"
)

# Step 15: Register correlation ID middleware (reads/generates X-Correlation-ID)
app.add_middleware(CorrelationIdMiddleware)

app.include_router(router)


@app.on_event("startup")
def startup_event():
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} on port {settings.PORT}")
    # Load trained ML artifacts once at startup (not per-request).
    # Falls back gracefully to stub mode if artifacts are missing.
    load_model(artifacts_dir=settings.ML_ARTIFACTS_DIR)
