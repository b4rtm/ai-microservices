from contextlib import asynccontextmanager
import logging
import os
from typing import AsyncGenerator

from fastapi import FastAPI

from app import consul, ml
from app.routers import spam

from opentelemetry.sdk.resources import Resource
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

from app.config import (
    SERVICE_NAME,
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    ml.load_model()
    try:
        ml.load_bert_model()
    except RuntimeError as exc:
        logger.warning("BERT model unavailable, /predict-bert will return 503: %s", exc)
    await consul.register()
    yield # App is running
    # Cleanup on shutdown
    await consul.deregister()
    ml.unload_bert_model()
    ml.unload_model()

def setup_tracing():
    if isinstance(trace.get_tracer_provider(), TracerProvider):
        return

    resource = Resource.create({
        "service.name": SERVICE_NAME,
        "service.instance.id": os.getenv("HOSTNAME", "local-dev"),
        "deployment.environment": "docker-compose",
    })

    provider = TracerProvider(resource=resource)
    exporter = OTLPSpanExporter(
        endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317"),
        insecure=True,
    )
    processor = BatchSpanProcessor(exporter)
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)


app = FastAPI(title="Spam Detection API", version="0.1.0", lifespan=lifespan)
app.include_router(spam.router)

setup_tracing()
FastAPIInstrumentor.instrument_app(app)
HTTPXClientInstrumentor().instrument()
LoggingInstrumentor().instrument(set_logging_format=True)
