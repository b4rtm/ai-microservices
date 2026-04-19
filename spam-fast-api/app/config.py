import os
import pathlib

MODEL_PATH = pathlib.Path(__file__).parent / "model" / "spam_model.joblib"
BERT_MODEL_DIR = pathlib.Path(__file__).parent.parent / "models" / "distilbert_spam_model"

CONSUL_HOST = os.getenv("CONSUL_HOST", "localhost")
CONSUL_PORT = os.getenv("CONSUL_PORT", "8500")
CONSUL_URL = f"http://{CONSUL_HOST}:{CONSUL_PORT}/v1"

SERVICE_ID = "spam-detection-service-1"
SERVICE_NAME = "spam-detection-service"
SERVICE_ADDRESS = os.getenv("SERVICE_ADDRESS", "spam-detection-service")
SERVICE_PORT = 8000
