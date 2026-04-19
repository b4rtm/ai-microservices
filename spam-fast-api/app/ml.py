import joblib
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from app.config import BERT_MODEL_DIR, MODEL_PATH

model = None
bert_model = None
bert_tokenizer = None


def load_model() -> None:
    global model
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Model not found at {MODEL_PATH}. Run 'python -m app.train' first."
        )
    model = joblib.load(MODEL_PATH)


def unload_model() -> None:
    global model
    model = None


def load_bert_model() -> None:
    global bert_model, bert_tokenizer
    if not BERT_MODEL_DIR.exists():
        raise RuntimeError(
            f"DistilBERT model not found at {BERT_MODEL_DIR}. Run 'python -m app.train_distilbert' first."
        )
    bert_tokenizer = AutoTokenizer.from_pretrained(str(BERT_MODEL_DIR))
    bert_model = AutoModelForSequenceClassification.from_pretrained(str(BERT_MODEL_DIR))
    bert_model.eval()


def unload_bert_model() -> None:
    global bert_model, bert_tokenizer
    bert_model = None
    bert_tokenizer = None
