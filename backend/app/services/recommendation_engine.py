from app.schemas.domain import (
    ArchitectureOption,
    ComparisonResult,
    RecommendationResult,
    RequirementModel,
)


class RecommendationEngine:
    def recommend(
        self,
        requirements: RequirementModel,
        architectures: list[ArchitectureOption],
        comparison: ComparisonResult,
    ) -> RecommendationResult:
        best_scorecard = max(comparison.scorecards, key=lambda item: item.weighted_score)
        architecture_lookup = {architecture.id: architecture for architecture in architectures}
        best_architecture = architecture_lookup[best_scorecard.architecture_id]

        why = [
            f"{best_architecture.name} fits the `{requirements.scale_profile}` profile with the strongest weighted trade-off balance.",
            "Its score is driven by the specific priorities in scalability, maintainability, delivery speed, and operational simplicity.",
            "It also leaves a clear path for incremental evolution if new platform capabilities are added later.",
        ]

        why_not: dict[str, list[str]] = {}
        for scorecard in comparison.scorecards:
            if scorecard.architecture_id == best_scorecard.architecture_id:
                continue
            why_not[scorecard.architecture_name] = [
                f"Weighted score {scorecard.weighted_score} is lower than {best_scorecard.weighted_score}.",
                scorecard.risks[0],
                "The trade-offs are less favorable for the current brief's budget and operational maturity.",
            ]

        rollout_plan = [
            "Start with the recommended architecture and establish module boundaries plus API contracts early.",
            "Instrument critical flows with logs, metrics, and audit traces before scaling out.",
            "Use the impact-aware regeneration workflow to evolve only affected artifacts as requirements change.",
        ]

        confidence = "High" if best_scorecard.weighted_score >= 76 else "Medium"

        return RecommendationResult(
            recommended_architecture_id=best_architecture.id,
            recommended_architecture_name=best_architecture.name,
            decision_summary=(
                f"{best_architecture.name} is the best-fit architecture for this brief because it offers "
                "the strongest balance between scale-readiness, implementation speed, and maintainable operations."
            ),
            why=why,
            why_not=why_not,
            rollout_plan=rollout_plan,
            confidence=confidence,
        )

