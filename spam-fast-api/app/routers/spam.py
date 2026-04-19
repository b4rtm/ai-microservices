import torch
from fastapi import APIRouter, HTTPException

from app import ml
from app.schemas import PredictRequest, PredictResponse

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


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
    )


@router.post("/predict-bert", response_model=PredictResponse)
def predict_bert(request: PredictRequest) -> PredictResponse:
    if ml.bert_model is None or ml.bert_tokenizer is None:
        raise HTTPException(status_code=503, detail="BERT model not loaded")

    inputs = ml.bert_tokenizer(
        request.text,
        return_tensors="pt",
        truncation=True,
        max_length=64,
        padding=True,
    )
    with torch.no_grad():
        outputs = ml.bert_model(**inputs)

    probs = torch.softmax(outputs.logits, dim=-1)[0]
    id2label = ml.bert_model.config.id2label  # e.g. {0: "ham", 1: "spam"}

    spam_idx = next(i for i, label in id2label.items() if label.lower() == "spam")
    spam_prob = float(probs[spam_idx])
    predicted_label = id2label[int(torch.argmax(probs))].lower()

    return PredictResponse(
        category="spam" if predicted_label == "spam" else "not-spam",
        spam_probability=round(spam_prob, 4),
    )
