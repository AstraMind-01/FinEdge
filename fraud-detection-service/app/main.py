import logging
from fastapi import FastAPI
from app.api.routes import router
from app.config.settings import settings

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="FinEdge AI Fraud Detection Microservice (Scaffolding & Mock Evaluator)"
)

app.include_router(router)


@app.on_event("startup")
def startup_event():
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} on port {settings.PORT}")
