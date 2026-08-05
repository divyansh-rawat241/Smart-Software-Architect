import json
import logging
from typing import Any

import httpx

from app.core.config import get_settings
from app.services.ai.prompts import build_structured_prompt

logger = logging.getLogger(__name__)


class OllamaStructuredClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    def refine(self, stage: str, seed: dict[str, Any]) -> dict[str, Any] | None:
        if not self.settings.ollama_enabled:
            return None

        payload = {
            "model": self.settings.ollama_model,
            "stream": False,
            "format": "json",
            "messages": [
                {
                    "role": "system",
                    "content": "You return structured JSON only.",
                },
                {
                    "role": "user",
                    "content": build_structured_prompt(stage, seed),
                },
            ],
        }

        try:
            with httpx.Client(
                base_url=self.settings.ollama_base_url,
                timeout=self.settings.request_timeout_seconds,
            ) as client:
                response = client.post("/api/chat", json=payload)
                response.raise_for_status()
                content = response.json()["message"]["content"]
                refined = json.loads(content)
                if isinstance(refined, dict):
                    return refined
        except Exception as exc:  # pragma: no cover - network failures are expected locally
            logger.info("Skipping Ollama refinement for %s: %s", stage, exc)

        return None

