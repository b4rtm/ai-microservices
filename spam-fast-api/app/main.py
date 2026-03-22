import pathlib
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

MODEL_PATH = pathlib.Path(__file__).parent / "model" / "spam_model.joblib"

model = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    global model
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Model not found at {MODEL_PATH}. Run 'python -m app.train' first."
        )
    model = joblib.load(MODEL_PATH)
    yield
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
    spam_prob = float(proba[1])
    label = int(spam_prob >= 0.5)

    return PredictResponse(
        category="spam" if label == 1 else "not-spam",
        spam_probability=round(spam_prob, 4),
    )
