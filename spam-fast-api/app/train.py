import pathlib

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

TRAIN_DATA_PATH = pathlib.Path(__file__).parent.parent / "data" / "spam_messages_train.csv"
TEST_DATA_PATH = pathlib.Path(__file__).parent.parent / "data" / "spam_messages_test.csv"
MODEL_DIR = pathlib.Path(__file__).parent / "model"
MODEL_PATH = MODEL_DIR / "spam_model.joblib"

def train() -> None:
    print("Loading train dataset...")
    train_df = pd.read_csv(TRAIN_DATA_PATH)

    X_train = train_df["text"].astype(str)
    y_train = train_df["label"].astype(str).str.lower()

    print(
        f"Train size: {len(train_df)} rows  |  "
        f"spam={(y_train == 'spam').sum()}  ham={(y_train == 'ham').sum()}"
    )

    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(stop_words="english", max_features=50_000)),
            ("clf", MultinomialNB()),
        ]
    )

    print("Training model...")
    pipeline.fit(X_train, y_train)

    print("Loading test dataset...")
    test_df = pd.read_csv(TEST_DATA_PATH)
    X_test = test_df["text"].astype(str)
    y_test = test_df["label"].astype(str).str.lower()

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Test accuracy: {acc:.4f}")
    print("Test classification report:")
    print(classification_report(y_test, y_pred, digits=4))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    train()
