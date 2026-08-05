import re
from dataclasses import dataclass

from app.schemas.domain import Actor, RequirementModel
from app.services.ai.client import OllamaStructuredClient


@dataclass(frozen=True)
class DomainBlueprint:
    domain: str
    keywords: tuple[str, ...]
    actors: tuple[tuple[str, str], ...]
    features: tuple[str, ...]
    entities: tuple[str, ...]
    compliance: tuple[str, ...]


BLUEPRINTS = (
    DomainBlueprint(
        domain="EV Charging Booking Platform",
        keywords=("ev charging", "charging station", "charger", "charging slot", "slot reservation"),
        actors=(
            ("Driver", "Searches stations, reserves slots, pays securely, and manages charging sessions."),
            ("Station Operator", "Maintains stations, chargers, slot schedules, and availability states."),
            ("Platform Admin", "Reviews analytics, incidents, refunds, and operational performance."),
            ("Support Agent", "Resolves booking issues, refunds, and customer escalations."),
        ),
        features=(
            "Search nearby charging stations with connector, speed, and pricing filters.",
            "Check real-time charger availability and detailed station information.",
            "Reserve a charging slot and complete payment securely.",
            "Start, monitor, and stop charging sessions with live status feedback.",
            "Cancel bookings, request refunds, and review charging history.",
            "Enable station operators to manage stations, chargers, and slot availability.",
            "Provide admin dashboards for utilization, revenue, and incident tracking.",
        ),
        entities=("users", "stations", "chargers", "bookings", "charging_sessions", "payments"),
        compliance=("payment integrity", "station availability audit trail", "role-based access control"),
    ),
    DomainBlueprint(
        domain="Online Pharmacy",
        keywords=("pharmacy", "medicine", "drug", "prescription"),
        actors=(
            ("Customer", "Browses medicine catalog, uploads prescriptions, and tracks orders."),
            ("Pharmacist", "Validates prescriptions and manages inventory approvals."),
            ("Delivery Partner", "Handles order fulfillment and delivery confirmation."),
            ("Operations Admin", "Monitors stock, pricing, and platform activity."),
        ),
        features=(
            "Support catalog search with category and availability filtering.",
            "Allow prescription upload and pharmacist verification workflows.",
            "Enable secure checkout, payment, and order tracking.",
            "Manage stock levels, substitutions, and fulfillment SLAs.",
            "Trigger notifications for order status and prescription issues.",
        ),
        entities=(
            "users",
            "products",
            "inventory",
            "prescriptions",
            "orders",
            "order_items",
            "payments",
            "shipments",
        ),
        compliance=("PII protection", "prescription audit trail", "role-based access control"),
    ),
    DomainBlueprint(
        domain="E-Commerce Platform",
        keywords=("shop", "commerce", "store", "marketplace", "cart"),
        actors=(
            ("Buyer", "Searches products, places orders, and reviews order history."),
            ("Merchant", "Publishes catalog items and manages inventory levels."),
            ("Support Agent", "Handles refunds, disputes, and escalations."),
            ("Platform Admin", "Oversees pricing rules, users, and system health."),
        ),
        features=(
            "Support product catalog browsing, search, and rich filtering.",
            "Enable cart, checkout, payment, and returns management.",
            "Handle order lifecycle updates and customer notifications.",
            "Provide merchant-facing inventory and fulfillment tooling.",
            "Expose operational dashboards and audit logs for administrators.",
        ),
        entities=("users", "products", "orders", "order_items", "payments", "shipments"),
        compliance=("PCI-aware payment integration", "audit logging", "data privacy controls"),
    ),
    DomainBlueprint(
        domain="Learning Platform",
        keywords=("course", "learning", "student", "education", "classroom"),
        actors=(
            ("Learner", "Consumes courses, submits work, and tracks progress."),
            ("Instructor", "Publishes lessons, assignments, and assessments."),
            ("Reviewer", "Grades submissions and moderates learner activity."),
            ("Program Admin", "Configures cohorts, analytics, and access policies."),
        ),
        features=(
            "Manage course catalogs, lessons, assignments, and assessments.",
            "Track enrollment, progress, submissions, and learner milestones.",
            "Send reminders, grading updates, and completion notifications.",
            "Provide instructor dashboards and analytics insights.",
            "Support role-based collaboration across cohorts and programs.",
        ),
        entities=("users", "courses", "enrollments", "lessons", "submissions", "notifications"),
        compliance=("access control", "content auditability", "retention policies"),
    ),
)


class RequirementAnalyzer:
    def __init__(self) -> None:
        self.ai_client = OllamaStructuredClient()

    def analyze(
        self,
        title: str,
        description: str,
        business_context: str | None = None,
        answers: dict[str, str] | None = None,
        constraints: list[str] | None = None,
    ) -> RequirementModel:
        combined_text = " ".join(
            part for part in [title, description, business_context or ""] if part
        )
        blueprint = self._pick_blueprint(combined_text)
        answers = answers or {}
        constraints = constraints or []
        scale_profile = self._infer_scale_profile(combined_text, answers)

        functional_requirements = list(blueprint.features)
        functional_requirements.extend(self._feature_overrides(combined_text))

        non_functional_requirements = [
            "Maintain clear bounded contexts and strongly typed service contracts.",
            "Capture structured logs, metrics, and audit trails for all critical workflows.",
            "Enforce validation, graceful error handling, and resilient API boundaries.",
        ]
        if "high-scale" in scale_profile:
            non_functional_requirements.extend(
                [
                    "Scale horizontally for burst traffic and long-running background workloads.",
                    "Keep p95 API latency under 300 ms for core customer journeys.",
                ]
            )
        else:
            non_functional_requirements.append(
                "Optimize for fast delivery while preserving modular extensibility."
            )

        if any(keyword in combined_text.lower() for keyword in ("secure", "hipaa", "pci", "compliance")):
            non_functional_requirements.extend(
                [
                    "Apply fine-grained authorization and field-level data protection.",
                    "Retain immutable audit history for compliance-sensitive operations.",
                ]
            )

        domain_constraints = [f"Must support a {scale_profile.replace('-', ' ')} traffic profile."]
        domain_constraints.extend(f"Respect {item}." for item in blueprint.compliance)
        domain_constraints.extend(f"Constraint: {item}" for item in constraints)
        if budget := answers.get("budget"):
            domain_constraints.append(f"Target budget posture: {budget}.")
        if cloud := answers.get("preferred_cloud"):
            domain_constraints.append(f"Preferred cloud footprint: {cloud}.")

        assumptions = [
            "Primary consumers access the platform via responsive web applications.",
            "Internal operators require dashboards for monitoring and exception handling.",
            "The first release targets API-first delivery with room for future mobile channels.",
        ]
        if business_context:
            assumptions.append(f"Business context considered: {business_context}.")

        requirement_model = RequirementModel(
            summary=f"{title} is modeled as a {blueprint.domain.lower()} with emphasis on {scale_profile.replace('-', ' ')} delivery.",
            domain=blueprint.domain,
            scale_profile=scale_profile,
            functional_requirements=self._dedupe(functional_requirements),
            non_functional_requirements=self._dedupe(non_functional_requirements),
            actors=[Actor(name=name, description=description) for name, description in blueprint.actors],
            constraints=self._dedupe(domain_constraints),
            assumptions=self._dedupe(assumptions),
        )

        refined = self.ai_client.refine("requirement-analysis", requirement_model.model_dump())
        if refined:
            return RequirementModel.model_validate({**requirement_model.model_dump(), **refined})
        return requirement_model

    def append_change(self, requirements: RequirementModel, change_request: str) -> RequirementModel:
        updates = requirements.model_copy(deep=True)
        lower_change = change_request.lower()
        if "notification" in lower_change:
            updates.functional_requirements.append(
                "Support notification preferences and asynchronous delivery tracking."
            )
            updates.non_functional_requirements.append(
                "Notification workflows should remain eventually consistent and retry-safe."
            )
        if "analytics" in lower_change or "report" in lower_change:
            updates.functional_requirements.append(
                "Expose analytics dashboards and exportable reporting workflows."
            )
        if "payment" in lower_change:
            updates.functional_requirements.append(
                "Integrate secure payment authorization, capture, and refund workflows."
            )
        updates.assumptions.append(f"Change request considered: {change_request}.")
        return RequirementModel.model_validate(updates.model_dump())

    def _pick_blueprint(self, text: str) -> DomainBlueprint:
        lower_text = text.lower()
        for blueprint in BLUEPRINTS:
            if any(keyword in lower_text for keyword in blueprint.keywords):
                return blueprint

        return DomainBlueprint(
            domain="Digital Platform",
            keywords=(),
            actors=(
                ("End User", "Consumes the platform's core digital workflows."),
                ("Operations Manager", "Oversees day-to-day platform execution."),
                ("Administrator", "Configures access, policies, and operational controls."),
            ),
            features=(
                "Provide secure onboarding, authentication, and profile management.",
                "Support the core domain workflow with auditable state transitions.",
                "Offer dashboards, search, and operational reporting capabilities.",
                "Send notifications for user-facing and operational events.",
                "Expose admin workflows for moderation, analytics, and support.",
            ),
            entities=("users", "accounts", "workflows", "events", "notifications", "audit_logs"),
            compliance=("data privacy", "availability expectations", "operational auditability"),
        )

    def _infer_scale_profile(self, text: str, answers: dict[str, str]) -> str:
        lower_text = text.lower()
        scale_match = re.search(r"(\d[\d,]*)\s*(million|m|thousand|k)?\s+users?", lower_text)
        users = 0
        if scale_match:
            base = int(scale_match.group(1).replace(",", ""))
            suffix = scale_match.group(2)
            if suffix in {"million", "m"}:
                users = base * 1_000_000
            elif suffix in {"thousand", "k"}:
                users = base * 1_000
            else:
                users = base

        users = max(users, self._parse_user_count(answers.get("scale", "")))
        if users >= 250_000 or any(word in lower_text for word in ("real-time", "global", "multi-region")):
            return "high-scale"
        if users >= 25_000 or "regional" in lower_text:
            return "growth-scale"
        return "startup-scale"

    def _parse_user_count(self, value: str) -> int:
        match = re.search(r"(\d[\d,]*)", value)
        return int(match.group(1).replace(",", "")) if match else 0

    def _feature_overrides(self, text: str) -> list[str]:
        lower_text = text.lower()
        features: list[str] = []
        keyword_map = {
            "notification": "Allow users to manage notification preferences and delivery channels.",
            "payment": "Integrate payment authorization, settlement, and refund handling.",
            "search": "Provide full-text search with business-aware filtering.",
            "analytics": "Deliver usage analytics and operational KPI dashboards.",
            "chat": "Support conversational or collaborative workflows with moderation controls.",
            "mobile": "Keep APIs optimized for future mobile clients and offline-tolerant use cases.",
            "booking": "Allow users to reschedule or cancel reservations without losing operational traceability.",
            "charger": "Surface charger specifications, connector types, and live availability signals.",
            "station": "Present rich station details, operating windows, and wayfinding context.",
            "refund": "Support refund review flows with auditable payment status transitions.",
        }
        for keyword, feature in keyword_map.items():
            if keyword in lower_text:
                features.append(feature)
        return features

    def _dedupe(self, values: list[str]) -> list[str]:
        seen: set[str] = set()
        deduped: list[str] = []
        for value in values:
            if value not in seen:
                deduped.append(value)
                seen.add(value)
        return deduped
