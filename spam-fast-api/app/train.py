import pathlib

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

DATA_PATH = pathlib.Path(__file__).parent.parent / "data" / "email_text.csv"
MODEL_DIR = pathlib.Path(__file__).parent / "model"
MODEL_PATH = MODEL_DIR / "spam_model.joblib"


def train() -> None:
    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)

    X = df["text"].astype(str)
    y = df["label"]

    print(f"Dataset size: {len(df)} rows  |  spam={y.sum()}  ham={(y == 0).sum()}")

    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(stop_words="english", max_features=50_000)),
            ("clf", MultinomialNB()),
        ]
    )

    print("Training model...")
    pipeline.fit(X, y)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    train()
