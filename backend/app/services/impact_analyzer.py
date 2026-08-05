from app.schemas.domain import ImpactAssessment


class ImpactAnalyzer:
    MODULE_KEYWORDS = {
        "notification": ["requirements", "architectures", "database", "api", "deployment", "diagrams", "documentation"],
        "payment": ["requirements", "architectures", "database", "api", "deployment", "documentation"],
        "analytics": ["requirements", "architectures", "database", "api", "documentation", "diagrams"],
        "report": ["requirements", "api", "documentation", "diagrams"],
        "compliance": ["requirements", "architectures", "deployment", "documentation"],
        "search": ["requirements", "database", "api", "documentation"],
    }

    def assess(self, change_request: str) -> ImpactAssessment:
        lower_change = change_request.lower()
        impacted_modules: list[str] = []
        reasoning: list[str] = []

        for keyword, modules in self.MODULE_KEYWORDS.items():
            if keyword in lower_change:
                impacted_modules.extend(modules)
                reasoning.append(
                    f"Detected `{keyword}` in the change request, so related schema, APIs, and design artifacts must be refreshed."
                )

        if not impacted_modules:
            impacted_modules = ["requirements", "architectures", "comparison", "recommendation", "documentation"]
            reasoning.append(
                "The change request is broad, so the core decision outputs should be recalculated while preserving unrelated persistence artifacts."
            )

        deduped_modules: list[str] = []
        for module in impacted_modules:
            if module not in deduped_modules:
                deduped_modules.append(module)

        return ImpactAssessment(
            change_request=change_request,
            impacted_modules=deduped_modules,
            reasoning=reasoning,
            regenerated_sections=deduped_modules.copy(),
        )

