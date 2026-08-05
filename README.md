# ArchAI

ArchAI is a production-style software architecture decision engine that turns a natural language project brief into requirements, architecture options, comparison scorecards, diagrams, database design, API outlines, deployment recommendations, and exportable documentation.

## Tech stack

- Frontend: React, TypeScript, TailwindCSS, Mermaid, React Flow
- Backend: FastAPI, SQLAlchemy, Pydantic
- AI integration: Ollama with `qwen3:8b` fallback-friendly structured prompting
- Persistence: PostgreSQL-ready with zero-friction SQLite local fallback
- Documentation: Markdown and PDF export

## Monorepo layout

```text
frontend/    React application
backend/     FastAPI application
docker/      Shared container configuration
docs/        Supporting project documentation
```

## Quick start

### From the repository root

```bash
npm install
npm run dev
```

This starts:

- FastAPI on `http://127.0.0.1:8000`
- React on `http://127.0.0.1:5173`

Once both servers are up, run this end-to-end API smoke test from a second terminal:

```bash
npm run smoke
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Optional full stack with Docker

```bash
docker compose up --build
```

The backend will run even when Ollama is unavailable. When Ollama is running locally, ArchAI uses it to refine structured outputs produced by the rule-based pipeline.

## Key capabilities

- Requirement analysis with structured JSON output
- Clarification question generation and answer persistence
- Three architecture alternatives with deterministic scoring
- Recommendation reasoning with why/why-not breakdowns
- Mermaid and PlantUML generation for multiple diagram types
- Database schema, API design, deployment plan, and documentation generation
- Incremental impact-aware updates for change requests

## Verification checklist

- Backend tests: `pytest`
- Frontend tests: `npm run test -- --run`
- Frontend production build: `npm run build`
- End-to-end API smoke test: `npm run smoke`
