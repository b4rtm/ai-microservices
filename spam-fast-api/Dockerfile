FROM python:3.14-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency files first for better layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies (no dev, no editable, frozen lockfile)
RUN uv sync --frozen --no-dev --no-editable

# Copy application code and dataset
COPY app/ ./app/
COPY data/ ./data/

# Train the model and bake it into the image
RUN uv run python -m app.train

# Expose port
EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
