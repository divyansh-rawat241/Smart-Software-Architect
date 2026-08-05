from app.schemas.domain import ArchitectureComponent, ArchitectureOption, RequirementModel
from app.services.ai.client import OllamaStructuredClient


class ArchitectureGenerator:
    def __init__(self) -> None:
        self.ai_client = OllamaStructuredClient()

    def generate(
        self,
        requirements: RequirementModel,
        answers: dict[str, str] | None = None,
    ) -> list[ArchitectureOption]:
        answers = answers or {}
        options = [
            self._modular_monolith(requirements),
            self._event_driven_microservices(requirements),
            self._serverless(requirements, answers),
        ]
        refined = self.ai_client.refine(
            "architecture-generation", {"architectures": [item.model_dump() for item in options]}
        )
        if refined and isinstance(refined.get("architectures"), list):
            try:
                return [ArchitectureOption.model_validate(item) for item in refined["architectures"]]
            except Exception:
                return options
        return options

    def _shared_components(self, requirements: RequirementModel) -> list[ArchitectureComponent]:
        domain_service = requirements.domain.replace(" ", "")
        return [
            ArchitectureComponent(
                name="Web Client",
                responsibility="Hosts the requirement wizard, dashboards, diagrams, and exports.",
                technologies=["React", "TypeScript", "TailwindCSS"],
                interactions=["Calls ArchAI API endpoints", "Renders Mermaid diagrams"],
            ),
            ArchitectureComponent(
                name="API Layer",
                responsibility="Handles validation, orchestration, and CRUD style workspace flows.",
                technologies=["FastAPI", "Pydantic"],
                interactions=["Invokes AI pipeline services", "Persists project workspaces"],
            ),
            ArchitectureComponent(
                name=f"{domain_service} Core",
                responsibility="Encapsulates domain rules, analysis, scoring, and recommendation logic.",
                technologies=["Python services", "Rule engine"],
                interactions=["Uses structured JSON contracts", "Generates downstream artifacts"],
            ),
        ]

    def _modular_monolith(self, requirements: RequirementModel) -> ArchitectureOption:
        components = self._shared_components(requirements)
        components.extend(
            [
                ArchitectureComponent(
                    name="PostgreSQL",
                    responsibility="Stores workspaces, generated artifacts, and audit history.",
                    technologies=["PostgreSQL", "JSONB"],
                    interactions=["Receives transactional writes from the API layer"],
                ),
                ArchitectureComponent(
                    name="Background Jobs",
                    responsibility="Runs document exports, long-running comparisons, and notifications.",
                    technologies=["FastAPI background tasks", "Redis-ready queue adapter"],
                    interactions=["Consumes generation requests asynchronously"],
                ),
            ]
        )

        return ArchitectureOption(
            id="modular-monolith",
            name="Modular Monolith",
            style="Layered / Clean Architecture",
            overview="A single deployable service with clear module boundaries, ideal for fast delivery and disciplined evolution.",
            components=components,
            data_flow=[
                "Client submits project brief to the API layer.",
                "Requirement, comparison, and recommendation modules process the brief inside one deployable boundary.",
                "Artifacts are stored in PostgreSQL and returned to the frontend immediately or via background refresh.",
            ],
            technology_stack=["React", "FastAPI", "PostgreSQL", "Redis (optional)", "Ollama"],
            database="Single PostgreSQL cluster with JSONB artifact storage and relational metadata.",
            api_style="REST with OpenAPI documentation and async export endpoints.",
            deployment="Containerized application deployed behind NGINX with horizontal replicas.",
            advantages=[
                "Lowest operational overhead while preserving strong module boundaries.",
                "Excellent fit for MVP-to-growth transitions and smaller platform teams.",
                "Simplifies transactional consistency across generated artifacts.",
            ],
            disadvantages=[
                "Fault isolation is weaker than a distributed microservice topology.",
                "Independent team scaling is limited without further decomposition.",
            ],
            suitable_scenarios=[
                "A single team needs to ship quickly with strong architectural discipline.",
                "Compliance and debugging simplicity matter more than maximum autonomy.",
            ],
            estimated_complexity="Medium",
            estimated_cost="Low to medium",
            maintenance="Straightforward with one deployment unit and clear internal contracts.",
        )

    def _event_driven_microservices(self, requirements: RequirementModel) -> ArchitectureOption:
        return ArchitectureOption(
            id="event-driven-microservices",
            name="Event-Driven Microservices",
            style="Microservices / Event Driven",
            overview="Decomposes analysis, diagramming, scoring, and reporting into independent services with async event choreography.",
            components=[
                ArchitectureComponent(
                    name="API Gateway",
                    responsibility="Routes external traffic to bounded-context services.",
                    technologies=["NGINX", "FastAPI gateway"],
                    interactions=["Handles authentication, rate limiting, and aggregation"],
                ),
                ArchitectureComponent(
                    name="Requirement Service",
                    responsibility="Owns requirement extraction and clarification state.",
                    technologies=["FastAPI", "Pydantic"],
                    interactions=["Publishes domain events after updates"],
                ),
                ArchitectureComponent(
                    name="Decision Engine Service",
                    responsibility="Generates architectures, scores alternatives, and recommends an approach.",
                    technologies=["FastAPI", "Rule engine"],
                    interactions=["Consumes requirement events and emits decision snapshots"],
                ),
                ArchitectureComponent(
                    name="Artifact Service",
                    responsibility="Produces diagrams, API contracts, schema assets, and PDFs.",
                    technologies=["FastAPI", "Mermaid", "ReportLab"],
                    interactions=["Listens to decision updates and rebuild requests"],
                ),
                ArchitectureComponent(
                    name="Event Backbone",
                    responsibility="Decouples long-running workflows and partial regeneration paths.",
                    technologies=["Kafka or Redis Streams"],
                    interactions=["Carries architecture-changed and documentation-changed events"],
                ),
                ArchitectureComponent(
                    name="Polyglot Persistence",
                    responsibility="Stores transactional state, generated artifacts, and operational telemetry.",
                    technologies=["PostgreSQL", "Redis"],
                    interactions=["Supports service-local read/write patterns"],
                ),
            ],
            data_flow=[
                "Gateway forwards the project brief to the Requirement Service.",
                "Requirement updates publish events that trigger comparison, recommendation, and artifact pipelines.",
                "Artifact Service rebuilds only impacted outputs and stores versioned snapshots.",
            ],
            technology_stack=["React", "FastAPI", "PostgreSQL", "Redis", "Kafka", "Ollama"],
            database="Service-owned PostgreSQL schemas plus Redis for caching and event coordination.",
            api_style="REST externally, async events internally, versioned contracts between services.",
            deployment="Kubernetes-based deployment with service autoscaling and event infrastructure.",
            advantages=[
                "Best fault isolation and bounded-context autonomy.",
                "Strongest fit for high-scale workloads and parallel team ownership.",
                "Supports fine-grained incremental regeneration naturally.",
            ],
            disadvantages=[
                "Highest operational complexity and longer platform bootstrap time.",
                "Requires mature observability and contract governance.",
            ],
            suitable_scenarios=[
                "Traffic and team structure justify distributed ownership.",
                "Independent scaling and resilience are top priorities.",
            ],
            estimated_complexity="High",
            estimated_cost="High",
            maintenance="Operationally heavy but resilient when supported by platform engineering maturity.",
        )

    def _serverless(
        self, requirements: RequirementModel, answers: dict[str, str]
    ) -> ArchitectureOption:
        cloud = answers.get("preferred_cloud", "AWS or Azure")
        return ArchitectureOption(
            id="serverless-platform",
            name="Serverless Platform",
            style="Serverless / Managed Services",
            overview="Uses managed compute, storage, and event services to minimize operational burden and absorb unpredictable traffic.",
            components=[
                ArchitectureComponent(
                    name="Static Web App",
                    responsibility="Delivers the frontend through a CDN-backed static hosting layer.",
                    technologies=["Vite build", "CDN", "Object storage"],
                    interactions=["Calls managed API endpoints over HTTPS"],
                ),
                ArchitectureComponent(
                    name="Managed API",
                    responsibility="Runs stateless orchestration logic and secure HTTP endpoints.",
                    technologies=["Serverless functions", "API Gateway"],
                    interactions=["Invokes AI and generation pipelines on demand"],
                ),
                ArchitectureComponent(
                    name="Workflow Orchestrator",
                    responsibility="Coordinates long-running document, diagram, and comparison jobs.",
                    technologies=["Managed workflow engine", "Event bus"],
                    interactions=["Triggers partial regeneration steps asynchronously"],
                ),
                ArchitectureComponent(
                    name="Managed Data Layer",
                    responsibility="Persists core relational data and cached projections.",
                    technologies=["Managed PostgreSQL", "Managed Redis"],
                    interactions=["Supports autoscaling reads and transactional writes"],
                ),
            ],
            data_flow=[
                "CDN-hosted frontend sends generation requests to serverless APIs.",
                "Managed workflows fan out architecture, schema, and documentation tasks.",
                "Artifacts are written to managed storage and surfaced back through the API layer.",
            ],
            technology_stack=["React", "Serverless functions", "Managed PostgreSQL", "Managed queues", "Ollama bridge"],
            database="Managed PostgreSQL with read replicas and object storage for heavy exports.",
            api_style="REST backed by function endpoints and event-triggered background tasks.",
            deployment=f"Cloud-native deployment on {cloud} with managed autoscaling and CDN edge delivery.",
            advantages=[
                "Reduces baseline infrastructure overhead and simplifies elastic scaling.",
                "Strong fit for spiky workloads and lean operations teams.",
                "Managed services accelerate compliance and disaster recovery baselines.",
            ],
            disadvantages=[
                "Vendor coupling and cold-start behavior need active mitigation.",
                "Complex local debugging compared with a monolith.",
            ],
            suitable_scenarios=[
                "Teams want fast operational leverage with managed services.",
                "Traffic is bursty and cost should track real usage closely.",
            ],
            estimated_complexity="Medium to high",
            estimated_cost="Usage-based medium",
            maintenance="Moderate, with less infra maintenance but more vendor-specific architecture decisions.",
        )

