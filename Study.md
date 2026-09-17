# ArchAI: Complete Systems & Architecture Study Guide

A master technical study guide explaining the entire internal architecture, pipeline mechanics, mathematical scoring, governance models, and execution flow of **ArchAI**.

---

## 1. Executive Overview & System Philosophy

ArchAI is a production-style software architecture decision engine. It takes plain-English natural language project briefs and deterministically converts them into an end-to-end, traceable software architecture package:

```
[ Natural Language Brief ]
           │
           ▼
[ Step 1: Requirement Analyzer ] ────► [ Step 2: Clarification Engine ]
           │
           ▼
[ Step 3: Architecture Shortlisting (Top 3 of 6) ]
           │
           ▼
[ Step 4: Comparison Engine (12 Weighted Metrics) ]
           │
           ▼
[ Step 5: Recommendation Engine (Why/Why-Not Evidence) ]
           │
 ┌─────────┴───────────┬─────────────────────┬──────────────────┐
 ▼                     ▼                     ▼                  ▼
[ Step 6: Database ]  [ Step 7: APIs ]     [ Step 8: Deploy ] [ Step 9: Diagrams ]
 (DDL, PostGIS)        (OpenAPI, REST)       (K8s, Multi-Reg)   (7 UML Diagrams)
           │
           ▼
[ Interactive Prototype + ADRs + Causal Graph Traceability ]
```

### Key Engineering Principles
1. **Deterministic-First, AI-Assisted:** The core architecture scoring, candidate filtering, component dependency wiring, failure simulation, and ADR generation are 100% deterministic rules. When Ollama LLM (`qwen3:8b`) is available, it is strictly used for extracting structured JSON from unseen domain prose with grounding guards; if offline or slow, deterministic grammatical fallbacks execute seamlessly.
2. **Strict Non-Hallucination & Evidence Attribution:** Every actor, component, database entity, and deployment property must trace directly back to verified input text or confirmed clarification answers via the **Causal Graph**.
3. **Safe Mutations via Proposals:** Changes are never made directly to the database. The system outputs typed `ArchitectureChangeProposal` objects with optimistic concurrency control (`base_updated_at`) and automated Architecture Decision Records (ADRs).

---

## 2. Monorepo Structure & Key Modules

| Path | Purpose & Key Files |
| :--- | :--- |
| [`backend/app/main.py`](file:///home/divyansh/Documents/Final/Arch-Ai-software-project/backend/app/main.py) | FastAPI entry point, CORS middleware, API route registration. |
| [`backend/app/services/`](file:///home/divyansh/Documents/Final/Arch-Ai-software-project/backend/app/services/) | Core domain engines (Requirements, Architecture, Scoring, DDL, Diagrams). |
| [`backend/app/schemas/domain.py`](file:///home/divyansh/Documents/Final/Arch-Ai-software-project/backend/app/schemas/domain.py) | Pydantic v2 schemas defining all data contracts. |
| [`backend/app/models/workspace.py`](file:///home/divyansh/Documents/Final/Arch-Ai-software-project/backend/app/models/workspace.py) | SQLAlchemy hybrid model: JSON workspace state + relational accounts/history. |
| [`frontend/src/`](file:///home/divyansh/Documents/Final/Arch-Ai-software-project/frontend/src/) | React 19, TypeScript, Vite, TailwindCSS, TanStack Query, React Flow, Mermaid. |

---

## 3. The End-to-End 9-Step Generation Pipeline

### Step 1: Requirement Analysis (`requirement_analyzer.py` & `domain_inference.py`)
- **Domain Identification:** Evaluates keyword evidence across built-in domain blueprints (EV Charging, Online Pharmacy, E-Commerce, Learning Platform) or initiates raw brief extraction for unknown domains.
- **Actor & Entity Extraction:** Identifies human actors (`Logistics Operator`, `Registered User`), device actors (`Sensor Device`, `Ambulance Vehicle`), and external partners (`Hospital`, `Payment Gateway`). Extracts domain entities while filtering verbs, adjectives, and stop-words.
- **Bounded Context Partitioning:** Clusters related domain entities into DDD bounded contexts (e.g. `Telemetry`, `Violation & Alert`, `Identity`).

### Step 2: Clarification Engine (`clarification_engine.py`)
- Computes an **Input Completeness Score** (0–100%).
- Automatically detects missing requirement dimensions: SLA, expected peak traffic, team size, cloud hosting preference, authentication style, data formats, and multi-region failover needs.
- Generates targeted multiple-choice follow-up questions and persists answers.

### Step 3: Architecture Candidate Shortlisting (`architecture_generator.py`)
ArchAI maintains a curated catalog of **6 architecture patterns**:
1. `modular-monolith` — Layered / Clean Architecture with internal domain boundaries.
2. `service-based` — Coarse, independently deployable domain services with shared data governance.
3. `event-driven-microservices` — Fine-grained microservices decoupled via Kafka / Redis Streams.
4. `serverless-platform` — Managed FaaS compute, API gateways, and cloud datastores for elastic spiky traffic.
5. `hybrid-modular-serverless` — Transactional modular core with serverless edge function handlers.
6. `hybrid-event-serverless` — Coarse domain services paired with serverless event consumers.

**Shortlisting Logic:**
- Gated by workload signals: Serverless & Hybrids require variable/bursty demand; distributed event topologies require asynchronous streaming workloads.
- The engine calculates suitability deltas across scale profile, team size, latency targets, and compliance requirements, then shortlists the **top 3 candidates**.

### Step 4: Deterministic Scoring & Comparison Engine (`comparison_engine.py`)
The shortlisted 3 options are scored across **12 weighted metrics**:
- **Scalability, Performance, Maintainability, Security, Cost, Reliability, Availability, Deployment Complexity, Learning Curve, Development Time, Fault Isolation, Operational Complexity.**
- Directional calibration ensures metrics where lower is better (e.g. *Cost*, *Complexity*, *Learning Curve*) are transparently displayed while internally aligned to positive utility weights.

### Step 5: Recommendation Engine (`recommendation_engine.py`)
- Computes final ranking scores with tie-break stability.
- Identifies **near-ties** (margins $\le 1.0$ point) to prevent overstating narrow wins.
- Generates auditable **Why** and **Why Not** rationales citing concrete input evidence (e.g., *"Event-driven microservices won by 0.62 points due to 10k events/sec streaming volume"*).

### Step 6: Database Schema Generator (`database_generator.py`)
- Converts extracted entities and bounded contexts into an executable PostgreSQL DDL schema with primary keys (`UUID`), foreign keys, indexes, and normalization notes.
- **Polyglot & Geospatial Extension:** Automatically configures **PostGIS** when GPS tracking and spatial queries are detected, and pairs Redis or time-series datastores when high telemetry throughput is confirmed.

### Step 7: REST & Async API Generator (`api_generator.py`)
- Designs versioned REST endpoints (`GET`, `POST`, `PUT`, `DELETE`) grouped by bounded context.
- Formulates asynchronous event publication contracts (`PUBLISH /events/...`) for decoupled streams and legacy integrations.

### Step 8: Deployment & Infrastructure Generator (`deployment_generator.py`)
- Recommends containerized infrastructure (Docker, Kubernetes manifests, Ingress).
- Evaluates availability targets: If `"Always available"` or $\ge 99.99\%$ SLA is requested, it configures **multi-region active-passive or active-active failover** across 2+ regions with $\ge 3$ baseline replicas.
- Generates observability stacks: Prometheus metrics, structured correlation IDs (`trace_id`), and distributed tracing.

### Step 9: Multi-View UML Diagram Generator (`diagram_generator.py`)
Produces **7 UML diagrams** in both Mermaid and PlantUML:
1. **Use Case Diagram** — Human and machine actor boundaries and system interactions.
2. **Activity Diagram** — Concurrently executing business workflows with fork/join bars.
3. **Sequence Diagram** — End-to-end request tracing through API gateway, domain core, and database.
4. **Class Diagram** — Core entity classes with field types, nullability, and multiplicities.
5. **Entity-Relationship (ER) Diagram** — Crow's foot relational entities with PKs and FKs.
6. **Component Diagram** — Multi-tier view (Experience Layer, Application Services, Platform & Persistence).
7. **Deployment Diagram** — Kubernetes nodes, replicas, cloud regions, and network ingress topology.

---

## 4. Advanced Analysis & Simulation Engines

### A. Failure Impact Analysis / Outage Simulation (`outage_simulation_engine.py`)
- Simulates component outages: *"If the API Gateway or Event Backbone crashes, what happens?"*
- Evaluates dependency propagation rules based on architecture style and fault isolation scores.
- Labels affected components as `Healthy`, `Degraded`, or `Down`, scoring incident severity and suggesting concrete resilience mitigations.

### B. Precedent / Real-World Twin Matching (`twin_matching_engine.py`)
- Compares the recommended architecture score vector against curated, publicly documented systems:
  - **Shopify** (Modular core + Kafka)
  - **Netflix & Uber** (Microservices & streaming platforms)
  - **Monzo** (Clean architecture + microservices)
  - **Basecamp** (Cohesive monolith)
  - **Capital One & LEGO** (Serverless + managed cloud)
- Returns distance-based similarity scores, architecture lessons, and public precedent notes.

### C. Conway's Law & Team Boundary Fit (`conway_law_engine.py`)
- Analyzes team size versus architectural decomposition.
- Flags mismatches (e.g. a 4-person team attempting fine-grained microservices, or a 300-person team attempting a single monolithic deployment unit).

### D. Counterfactual Simulator (`counterfactual_simulator.py`)
- Answers *"What-If"* architectural pivots without altering the active workspace:
  - *"What if users grow from 50k to 2 million?"*
  - *"What if team size drops from 50 to 5 engineers?"*
  - *"What if availability moves from 99.0% to 99.99%?"*

---

## 5. The Architecture Copilot (AI Assistant)

The in-workspace assistant operates as a **dual-engine copilot**:
1. **Deterministic Resolution (`assistant_intel.py` & `assistant_analysis.py`):**
   - Answers in $< 10$ milliseconds.
   - Traverses the **Causal Graph** to explain why components exist, audits Single Points of Failure (SPOFs), and executes exact model lookups.
2. **Resilient LLM Inference (`architecture_assistant.py` & Ollama):**
   - Handles open-ended queries and whiteboard/image uploads with strict timeout budgets and schema validation.
3. **Change Proposals:**
   - Any design modification generates a typed `ArchitectureChangeProposal`.
   - The user reviews the proposal and clicks "Apply", which triggers `WorkspaceEditor` to surgically regenerate only affected downstream artifacts with full ADR tracking.

---

## 6. End-to-End Test Trial Case Study: Smart Emergency Ambulance Dispatch

In the latest trial (`Smart Emergency Ambulance Dispatch & Response Platform`):
- **Inputs:** 100k users, 2,000 ambulances, 2,000 GPS pings/sec, sub-5s dispatch SLA, AWS, "Always available" uptime across Indian cities.
- **Architectural Winner:** **Service-Based Architecture (77.37)** edged out **Event-Driven Microservices (77.02)** by 0.35 points (near tie). Coarse domain services avoided distributed saga overhead while Kafka handled high-frequency GPS streaming.
- **Database Model:** Generated `emergency`, `ambulance`, `city`, `hospital`, `audit_logs` with **PostgreSQL + PostGIS** for spatial radius queries.
- **Deployment Strategy:** Configured **Multi-Region Failover** (`Primary region`, `Secondary region (failover)`) with 3 replicas and active-passive regional replication to honor the *"Always available"* life-critical mandate.

---

## 7. How to Run, Test & Verify

- **Start Backend:** `npm run dev:backend` (FastAPI on port 8011)
- **Start Frontend:** `npm run dev:frontend` (Vite on port 5173)
- **Run Backend Tests:**
  ```bash
  PYTHONPATH=backend backend/.venv/bin/pytest backend/tests
  ```
- **Run Frontend Tests:**
  ```bash
  npm run test -- --run
  ```
- **End-to-End Smoke Test:**
  ```bash
  npm run smoke
  ```
