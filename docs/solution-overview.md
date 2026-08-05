# ArchAI Solution Overview

## Purpose

ArchAI converts a software project brief into:

- structured requirements
- clarification questions
- multiple architecture options
- rule-based comparison scorecards
- a recommendation with trade-off analysis
- diagrams, database design, API design, deployment guidance, and documentation

## Delivery model

- `frontend/` provides the React interface for project intake, architecture review, comparison analytics, diagram rendering, and documentation export.
- `backend/` provides the FastAPI orchestration layer, persistence, rule-based analysis engines, optional Ollama refinement, and PDF export endpoints.
- `docker-compose.yml` provides a PostgreSQL-backed local stack for end-to-end deployment testing.

## Incremental evolution

ArchAI includes impact-aware change handling so requirement updates can selectively regenerate affected outputs instead of rerunning the entire pipeline every time.
