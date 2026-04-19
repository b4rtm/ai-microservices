from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI

from app import consul, ml
from app.routers import spam


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    ml.load_model()
    ml.load_bert_model()
    await consul.register()
    yield # App is running
    # Cleanup on shutdown
    await consul.deregister()
    ml.unload_bert_model()
    ml.unload_model()


app = FastAPI(title="Spam Detection API", version="0.1.0", lifespan=lifespan)
app.include_router(spam.router)

