from app.schemas.domain import (
    ArchitectureOption,
    ArchitectureScorecard,
    ComparisonResult,
    MetricScore,
    RequirementModel,
)

METRICS = [
    "scalability",
    "performance",
    "maintainability",
    "security",
    "cost",
    "reliability",
    "availability",
    "deployment_complexity",
    "learning_curve",
    "development_time",
    "fault_isolation",
    "operational_complexity",
]

BASE_PROFILES = {
    "modular-monolith": {
        "scalability": 7,
        "performance": 8,
        "maintainability": 8,
        "security": 8,
        "cost": 9,
        "reliability": 8,
        "availability": 7,
        "deployment_complexity": 9,
        "learning_curve": 9,
        "development_time": 9,
        "fault_isolation": 6,
        "operational_complexity": 9,
    },
    "event-driven-microservices": {
        "scalability": 9,
        "performance": 8,
        "maintainability": 7,
        "security": 8,
        "cost": 4,
        "reliability": 8,
        "availability": 9,
        "deployment_complexity": 4,
        "learning_curve": 4,
        "development_time": 5,
        "fault_isolation": 9,
        "operational_complexity": 4,
    },
    "serverless-platform": {
        "scalability": 8,
        "performance": 7,
        "maintainability": 7,
        "security": 8,
        "cost": 7,
        "reliability": 8,
        "availability": 8,
        "deployment_complexity": 7,
        "learning_curve": 6,
        "development_time": 7,
        "fault_isolation": 7,
        "operational_complexity": 7,
    },
}


class ComparisonEngine:
    def compare(
        self,
        requirements: RequirementModel,
        architectures: list[ArchitectureOption],
        answers: dict[str, str] | None = None,
    ) -> ComparisonResult:
        weights = self._build_weights(requirements)
        scorecards: list[ArchitectureScorecard] = []

        for architecture in architectures:
            profile = BASE_PROFILES[architecture.id].copy()
            profile = self._apply_adjustments(profile, architecture.id, requirements, answers or {})
            metric_scores = [
                MetricScore(
                    metric=metric,
                    score=profile[metric],
                    explanation=self._explain(metric, profile[metric], architecture.name, requirements),
                )
                for metric in METRICS
            ]
            overall_score = round(
                sum(item.score for item in metric_scores) / max(len(metric_scores), 1), 1
            )
            weighted_score = round(
                sum(profile[metric] * weights[metric] for metric in METRICS) * 10, 1
            )
            scorecards.append(
                ArchitectureScorecard(
                    architecture_id=architecture.id,
                    architecture_name=architecture.name,
                    overall_score=overall_score,
                    weighted_score=weighted_score,
                    metric_scores=metric_scores,
                    strengths=self._strengths(architecture.id),
                    risks=self._risks(architecture.id),
                )
            )

        reasoning = [
            "Scores are rule-based and derived from scale profile, delivery speed, and operational posture.",
            f"Scale profile `{requirements.scale_profile}` increases weight on scalability, reliability, and availability.",
            "Cost and complexity metrics favor simpler deployment topologies when the brief does not justify distributed systems overhead.",
        ]

        return ComparisonResult(weights=weights, scorecards=scorecards, reasoning=reasoning)

    def _build_weights(self, requirements: RequirementModel) -> dict[str, float]:
        weights = {
            "scalability": 0.12,
            "performance": 0.09,
            "maintainability": 0.1,
            "security": 0.1,
            "cost": 0.08,
            "reliability": 0.09,
            "availability": 0.08,
            "deployment_complexity": 0.08,
            "learning_curve": 0.06,
            "development_time": 0.08,
            "fault_isolation": 0.06,
            "operational_complexity": 0.06,
        }

        if requirements.scale_profile == "high-scale":
            weights["scalability"] += 0.05
            weights["availability"] += 0.03
            weights["reliability"] += 0.02
            weights["cost"] -= 0.02
            weights["development_time"] -= 0.02
        elif requirements.scale_profile == "startup-scale":
            weights["cost"] += 0.03
            weights["development_time"] += 0.03
            weights["deployment_complexity"] += 0.02
            weights["fault_isolation"] -= 0.02

        total = sum(weights.values())
        return {metric: round(value / total, 4) for metric, value in weights.items()}

    def _apply_adjustments(
        self,
        profile: dict[str, int],
        architecture_id: str,
        requirements: RequirementModel,
        answers: dict[str, str],
    ) -> dict[str, int]:
        lower_requirements = " ".join(
            requirements.functional_requirements + requirements.non_functional_requirements
        ).lower()

        if requirements.scale_profile == "high-scale":
            if architecture_id == "event-driven-microservices":
                profile["scalability"] += 1
                profile["availability"] += 1
            if architecture_id == "modular-monolith":
                profile["fault_isolation"] -= 1
        if "audit" in lower_requirements or "compliance" in lower_requirements:
            profile["security"] += 1
            if architecture_id == "serverless-platform":
                profile["learning_curve"] -= 1
        if answers.get("preferred_cloud", "").lower() in {"aws", "azure", "gcp"}:
            if architecture_id == "serverless-platform":
                profile["deployment_complexity"] += 1
                profile["cost"] += 1
        if answers.get("budget", "").lower() in {"low", "constrained", "startup"}:
            if architecture_id == "event-driven-microservices":
                profile["cost"] -= 2
                profile["development_time"] -= 1
            if architecture_id == "modular-monolith":
                profile["cost"] += 1
        return {metric: max(1, min(10, score)) for metric, score in profile.items()}

    def _explain(
        self,
        metric: str,
        score: int,
        architecture_name: str,
        requirements: RequirementModel,
    ) -> str:
        scale_reason = (
            "the high-scale brief rewards horizontal elasticity"
            if requirements.scale_profile == "high-scale"
            else "the current brief rewards controlled complexity"
        )
        return (
            f"{architecture_name} scores {score}/10 for {metric.replace('_', ' ')} because "
            f"{scale_reason} and this option balances that against delivery and operations trade-offs."
        )

    def _strengths(self, architecture_id: str) -> list[str]:
        strength_map = {
            "modular-monolith": [
                "Fastest path to a cohesive first production release.",
                "Clear internal modularity without distributed system overhead.",
            ],
            "event-driven-microservices": [
                "Strong isolation across bounded contexts and workloads.",
                "Natural fit for asynchronous regeneration and scaling hotspots.",
            ],
            "serverless-platform": [
                "Elastic infrastructure with lower steady-state ops load.",
                "Good balance between scale handling and platform team size.",
            ],
        }
        return strength_map[architecture_id]

    def _risks(self, architecture_id: str) -> list[str]:
        risk_map = {
            "modular-monolith": [
                "Requires team discipline to avoid tight coupling over time.",
                "May need later decomposition if traffic or team size grows sharply.",
            ],
            "event-driven-microservices": [
                "Operational load is high for early-stage teams.",
                "Distributed tracing and contract governance become mandatory quickly.",
            ],
            "serverless-platform": [
                "Vendor-specific tooling may influence long-term portability.",
                "Workflow observability needs deliberate investment.",
            ],
        }
        return risk_map[architecture_id]

