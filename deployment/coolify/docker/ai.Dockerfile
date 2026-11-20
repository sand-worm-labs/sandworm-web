# The AI service (apps/ai, a git submodule) for production. Its own Dockerfile
# is for local development: it mounts the source and runs with --reload. This
# one copies the source in and runs it plainly.
#
#   docker build -f deployment/coolify/docker/ai.Dockerfile -t sandworm-ai apps/ai

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN pip install --quiet poetry \
    && poetry config virtualenvs.create false

COPY pyproject.toml poetry.lock README.md ./
RUN poetry install --no-root --no-interaction --quiet

COPY src ./src

RUN useradd --create-home --uid 10001 app
USER app

EXPOSE 8000
CMD ["uvicorn", "src.__main__:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
