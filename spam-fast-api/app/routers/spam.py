import os

from fastapi import APIRouter, HTTPException

from app import ml
from app.schemas import PredictRequest, PredictResponse

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok",
            "id": os.getenv("HOSTNAME")}


@router.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    if ml.model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    proba = ml.model.predict_proba([request.text])[0]
    classes = [str(c).lower() for c in ml.model.classes_]
    if "spam" not in classes:
        raise HTTPException(status_code=500, detail="Model classes missing 'spam' label")

    spam_idx = classes.index("spam")
    spam_prob = float(proba[spam_idx])
    predicted_label = str(ml.model.predict([request.text])[0]).lower()

    return PredictResponse(
        category="spam" if predicted_label == "spam" else "not-spam",
        spam_probability=round(spam_prob, 4),
        instance=os.getenv("HOSTNAME"),
    )
