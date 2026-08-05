import json


def build_structured_prompt(stage: str, payload: dict) -> str:
    return (
        f"You are ArchAI's {stage} assistant.\n"
        "Return valid JSON only.\n"
        "Keep the same schema shape as the input seed and only improve specificity.\n"
        f"Seed JSON:\n{json.dumps(payload, indent=2)}"
    )

