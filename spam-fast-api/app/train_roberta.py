import pathlib

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import accuracy_score, classification_report
from torch.utils.data import Dataset
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)

TRAIN_DATA_PATH = pathlib.Path(__file__).parent.parent / "data" / "spam_messages_train.csv"
TEST_DATA_PATH = pathlib.Path(__file__).parent.parent / "data" / "spam_messages_test.csv"
MODEL_DIR = pathlib.Path(__file__).parent / "model" / "distilroberta_spam_model"

MODEL_NAME = "distilroberta-base"
LABEL2ID = {"ham": 0, "spam": 1}
ID2LABEL = {0: "ham", 1: "spam"}
MAX_LENGTH = 64
MAX_TRAIN_SAMPLES = 5_000


class SpamDataset(Dataset):
    def __init__(self, texts: list[str], labels: list[int], tokenizer: AutoTokenizer) -> None:
        self.encodings = tokenizer(
            texts,
            truncation=True,
            padding=True,
            max_length=MAX_LENGTH,
            return_tensors="pt",
        )
        self.labels = labels

    def __len__(self) -> int:
        return len(self.labels)

    def __getitem__(self, idx: int) -> dict:
        item = {key: val[idx] for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item


def compute_metrics(eval_pred) -> dict:
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return {"accuracy": accuracy_score(labels, predictions)}


def train() -> None:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    print("Loading train dataset...")
    train_df = pd.read_csv(TRAIN_DATA_PATH)
    if len(train_df) > MAX_TRAIN_SAMPLES:
        train_df = train_df.sample(n=MAX_TRAIN_SAMPLES, random_state=42)
    train_texts = train_df["text"].astype(str).tolist()
    train_labels = train_df["label"].astype(str).str.lower().map(LABEL2ID).tolist()

    print(
        f"Train size: {len(train_df)} rows  |  "
        f"spam={train_labels.count(1)}  ham={train_labels.count(0)}"
    )

    print("Loading test dataset...")
    test_df = pd.read_csv(TEST_DATA_PATH)
    test_texts = test_df["text"].astype(str).tolist()
    test_labels = test_df["label"].astype(str).str.lower().map(LABEL2ID).tolist()

    print(f"Loading tokenizer: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    train_dataset = SpamDataset(train_texts, train_labels, tokenizer)
    test_dataset = SpamDataset(test_texts, test_labels, tokenizer)

    print(f"Loading model: {MODEL_NAME}")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=2,
        id2label=ID2LABEL,
        label2id=LABEL2ID,
    )

    training_args = TrainingArguments(
        output_dir=str(MODEL_DIR / "checkpoints"),
        num_train_epochs=1,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=16,
        warmup_steps=100,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        logging_steps=50,
        fp16=torch.cuda.is_available(),
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        compute_metrics=compute_metrics,
    )

    print("Training DistilRoBERTa model...")
    trainer.train()

    print("Evaluating on test set...")
    predictions = trainer.predict(test_dataset)
    y_pred = np.argmax(predictions.predictions, axis=-1)
    y_true = np.array(test_labels)

    acc = accuracy_score(y_true, y_pred)
    print(f"Test accuracy: {acc:.4f}")
    print("Test classification report:")
    print(
        classification_report(
            y_true,
            y_pred,
            target_names=["ham", "spam"],
            digits=4,
        )
    )

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(MODEL_DIR)
    tokenizer.save_pretrained(MODEL_DIR)
    print(f"Model and tokenizer saved to {MODEL_DIR}")


if __name__ == "__main__":
    train()
