"""
FinEdge Fraud Detection Service — Correlation ID Middleware (Step 15)

Reads X-Correlation-ID from the incoming request header (forwarded by
transaction-service's RestTemplate interceptor or the API gateway) and makes
it available for logging throughout the request lifecycle.

Approach: Uses Python's contextvars for request-scoped storage (the Python
equivalent of SLF4J MDC). A custom logging.Filter injects the correlation ID
into every log record, so the formatter can include it via %(correlationId)s.

This is simpler than a full MDC-equivalent library and appropriate for a
single-service Python component in a mixed Java/Python college project.
"""

import logging
import uuid
from contextvars import ContextVar

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Context variable holding the correlation ID for the current request
correlation_id_var: ContextVar[str] = ContextVar("correlation_id", default="none")

HEADER_NAME = "X-Correlation-ID"


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    ASGI middleware that reads X-Correlation-ID from the request,
    generates one if missing, and stores it in a ContextVar for the
    duration of the request.
    """

    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get(HEADER_NAME)

        if not correlation_id or correlation_id.strip() == "":
            correlation_id = str(uuid.uuid4())

        # Store in context var (accessible by logging filter and handlers)
        token = correlation_id_var.set(correlation_id)

        try:
            response = await call_next(request)
            # Also set on response headers (defensive, for direct-to-service calls)
            response.headers[HEADER_NAME] = correlation_id
            return response
        finally:
            correlation_id_var.reset(token)


class CorrelationIdLogFilter(logging.Filter):
    """
    Logging filter that injects the current request's correlation ID
    into every log record as %(correlationId)s.

    Attach this filter to the root logger so all log lines include it.
    Outside a request context (e.g. startup logs), defaults to "none".
    """

    def filter(self, record):
        record.correlationId = correlation_id_var.get("none")
        return True
