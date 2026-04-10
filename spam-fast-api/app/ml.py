import joblib

from app.config import MODEL_PATH

model = None


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
