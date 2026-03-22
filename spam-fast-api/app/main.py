import os
import pathlib
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import httpx
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

MODEL_PATH = pathlib.Path(__file__).parent / "model" / "spam_model.joblib"

CONSUL_HOST = os.getenv("CONSUL_HOST", "localhost")
CONSUL_PORT = os.getenv("CONSUL_PORT", "8500")
CONSUL_URL = f"http://{CONSUL_HOST}:{CONSUL_PORT}/v1"

SERVICE_ID = "spam-detection-service-1"
SERVICE_NAME = "spam-detection-service"
SERVICE_ADDRESS = os.getenv("SERVICE_ADDRESS", "spam-detection-service")
SERVICE_PORT = 8000

model = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    global model
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Model not found at {MODEL_PATH}. Run 'python -m app.train' first."
        )
    model = joblib.load(MODEL_PATH)

    async with httpx.AsyncClient() as client:
        await client.put(
            f"{CONSUL_URL}/agent/service/register",
            json={
                "ID": SERVICE_ID,
                "Name": SERVICE_NAME,
                "Address": SERVICE_ADDRESS,
                "Port": SERVICE_PORT,
                "Check": {
                    "HTTP": f"http://{SERVICE_ADDRESS}:{SERVICE_PORT}/health",
                    "Interval": "10s",
                    "DeregisterCriticalServiceAfter": "1m",
                },
            },
        )

    yield

    async with httpx.AsyncClient() as client:
        await client.put(f"{CONSUL_URL}/agent/service/deregister/{SERVICE_ID}")

    model = None


app = FastAPI(title="Spam Detection API", version="0.1.0", lifespan=lifespan)


class PredictRequest(BaseModel):
    text: str


class PredictResponse(BaseModel):
    category: str
    spam_probability: float


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    proba = model.predict_proba([request.text])[0]
    classes = [str(c).lower() for c in model.classes_]
    if "spam" not in classes:
        raise HTTPException(status_code=500, detail="Model classes missing 'spam' label")

    spam_idx = classes.index("spam")
    spam_prob = float(proba[spam_idx])
    predicted_label = str(model.predict([request.text])[0]).lower()

    return PredictResponse(
        category="spam" if predicted_label == "spam" else "not-spam",
        spam_probability=round(spam_prob, 4),
    )
