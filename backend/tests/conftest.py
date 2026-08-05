import os

import pytest
from fastapi.testclient import TestClient

TEST_DB_PATH = "sqlite:///./test_archai.db"
os.environ["ARCHAI_DATABASE_URL"] = TEST_DB_PATH
os.environ["ARCHAI_OLLAMA_ENABLED"] = "false"

from app.core.config import get_settings  # noqa: E402

get_settings.cache_clear()

from app.main import app  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client
