from app.schemas.domain import ClarificationPlan, ClarificationQuestion, RequirementModel


class ClarificationEngine:
    def generate(
        self,
        requirements: RequirementModel,
        answers: dict[str, str] | None = None,
    ) -> ClarificationPlan:
        answers = answers or {}
        questions: list[ClarificationQuestion] = []

        prompts = {
            "auth": (
                "security",
                "What authentication model is required for end users and internal operators?",
                "Authentication influences API design, authorization, and deployment hardening.",
                ["Email/password", "SSO/SAML", "Social login", "Passwordless"],
            ),
            "payments": (
                "commerce",
                "Are payments or billing flows part of the first release?",
                "Payment support affects database entities, APIs, and compliance controls.",
                ["Yes", "No", "Planned later"],
            ),
            "preferred_cloud": (
                "deployment",
                "Do you have a preferred cloud provider or hosting model?",
                "Cloud preference changes deployment architecture and managed service choices.",
                ["AWS", "Azure", "GCP", "On-premise", "No preference"],
            ),
            "sla": (
                "operations",
                "What availability target or SLA should the platform meet?",
                "Availability expectations drive redundancy, monitoring, and failover design.",
                ["99.5%", "99.9%", "99.95%", "Undecided"],
            ),
            "scale": (
                "scalability",
                "What peak concurrent traffic should the system be designed for?",
                "Peak traffic is a major signal for architecture style and data strategy.",
                ["<5k users", "5k-50k users", "50k-250k users", "250k+ users"],
            ),
            "retention": (
                "data",
                "How long should business and audit data be retained?",
                "Retention affects storage cost, indexing, and compliance reporting.",
                ["30 days", "1 year", "7 years", "Custom"],
            ),
        }

        missing_areas: list[str] = []
        for key, (category, question, rationale, options) in prompts.items():
            if not answers.get(key):
                missing_areas.append(key)
                questions.append(
                    ClarificationQuestion(
                        key=key,
                        category=category,
                        question=question,
                        rationale=rationale,
                        priority="high" if key in {"auth", "preferred_cloud", "scale"} else "medium",
                        options=options,
                    )
                )

        completeness = max(20, int(((len(prompts) - len(missing_areas)) / len(prompts)) * 100))

        if "payment" not in " ".join(requirements.functional_requirements).lower():
            questions.append(
                ClarificationQuestion(
                    key="payment_channels",
                    category="commerce",
                    question="If payments are included later, which channels should be prioritized?",
                    rationale="Planning payment extensibility early avoids API and schema rework.",
                    priority="low",
                    options=["Cards", "UPI", "Wallets", "Bank transfer"],
                )
            )

        return ClarificationPlan(
            completeness_score=completeness,
            missing_areas=missing_areas,
            questions=questions[:6],
        )

