# How to Run ArchAI

> A copy-paste-friendly guide so you never have to ask an AI to start the project again.

---

## Prerequisites

| Tool       | Minimum Version | Check with             |
|------------|-----------------|------------------------|
| Node.js    | 18+             | `node -v`              |
| npm        | 9+              | `npm -v`               |
| Python     | 3.12+           | `python3 --version`    |
| Ollama     | *(optional)*    | `ollama --version`     |
| Docker     | *(optional)*    | `docker --version`     |

---

## 1 · First-Time Setup (do this once)

Open a terminal **in the project root** (`software-project/`).

### 1.1 — Install root dependencies (concurrently)

```bash
npm install
```

### 1.2 — Create the Python virtual environment & install backend packages

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 1.3 — Install frontend packages

```bash
cd frontend
npm install
cd ..
```

### 1.4 — Set up environment variables

The repo already ships a `.env` inside `backend/`. If you ever need to reset it:

```bash
cp .env.example .env
cp .env.example backend/.env
```

Default config uses **SQLite** (zero setup) and **Ollama disabled**. Edit `backend/.env` to change that:

```dotenv
# Toggle AI features (requires Ollama running locally)
ARCHAI_OLLAMA_ENABLED=true        # set to false to skip Ollama
ARCHAI_OLLAMA_BASE_URL=http://localhost:11434
ARCHAI_OLLAMA_MODEL=qwen3:8b
```

---

## 2 · Run the Project (daily workflow)

### Option A — Single command (recommended)

From the project root, make sure the backend venv's Python is on your PATH, then:

```bash
# Activate the backend venv first so uvicorn is found
source backend/.venv/bin/activate

# Start both backend + frontend together
npm run dev
```

This launches:
- **Backend  (FastAPI)** → http://127.0.0.1:8000
- **Frontend (Vite/React)** → http://127.0.0.1:5173

Press `Ctrl+C` to stop both.

### Option B — Run backend & frontend in separate terminals

**Terminal 1 — Backend:**

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

### Option C — Docker Compose (full stack with PostgreSQL)

```bash
docker compose up --build
```

This starts:
- **PostgreSQL** on port `5432`
- **Backend** on port `8000`
- **Frontend** on port `3000`

---

## 3 · Running Tests

```bash
# All tests
npm run test

# Backend only
cd backend
source .venv/bin/activate
pytest

# Frontend only
cd frontend
npm run test -- --run
```

### Smoke test (end-to-end API check)

With both servers running in another terminal:

```bash
npm run smoke
```

---

## 4 · Other Useful Commands

| Command                    | What it does                          |
|----------------------------|---------------------------------------|
| `npm run build`            | Production build of the frontend      |
| `npm run lint`             | Lint the frontend code                |
| `npm run serve:frontend`   | Serve the production frontend build   |

---

## 5 · Troubleshooting

### "command not found: uvicorn"
You forgot to activate the virtual environment:
```bash
source backend/.venv/bin/activate
```

### Port already in use
Kill whatever is using the port:
```bash
# Find what's on port 8000
lsof -i :8000
# or force-kill it
kill -9 $(lsof -ti :8000)
```

### Frontend blank page / API errors
Make sure the backend is running **before** you open the frontend. The frontend proxies API calls to `http://127.0.0.1:8000`.

### Ollama not connecting
1. Make sure Ollama is running: `ollama serve`
2. Pull the model: `ollama pull qwen3:8b`
3. Set `ARCHAI_OLLAMA_ENABLED=true` in `backend/.env`

---

## Quick Reference (TL;DR)

```bash
# --- First time ---
npm install
cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..

# --- Every time ---
source backend/.venv/bin/activate
npm run dev

# Open http://127.0.0.1:5173 in your browser
```
