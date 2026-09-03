"""Stateless deterministic endpoints for team fit, industry twins, and budgets."""

from fastapi import APIRouter

from app.schemas.domain import (
    BudgetCompareRequest,
    BudgetEstimate,
    BudgetEstimateRequest,
    ConwayFitRequest,
    ConwayFitResult,
    RequirementAnalysis,
    TwinMatch,
    TwinMatchRequest,
)
from app.services.budget_estimator import generate_budget
from app.services.conway_law_engine import check_fit
from app.services.twin_matching_engine import match_twins

router = APIRouter(tags=["architecture-insights"])


@router.post("/conway-fit", response_model=ConwayFitResult)
def conway_fit(payload: ConwayFitRequest) -> ConwayFitResult:
    """Check architecture and team boundary fit using deterministic rules."""
    return check_fit(
        architecture=payload.architecture,
        analysis=RequirementAnalysis(detected_entities=payload.entities),
        constraints=payload.constraints,
    )


@router.post("/twin-match", response_model=list[TwinMatch])
def twin_match(payload: TwinMatchRequest) -> list[TwinMatch]:
    """Return the closest public architecture precedents without LLM calls."""
    return match_twins(
        comparison_matrix=payload.comparison_matrix,
        recommended_architecture_id=payload.recommended_architecture_id,
        deployment_stack=payload.deployment_stack,
        weights=payload.weights,
    )


@router.post("/budget-estimate", response_model=BudgetEstimate)
def budget_estimate(payload: BudgetEstimateRequest) -> BudgetEstimate:
    """Return an illustrative, deterministic monthly budget estimate."""
    return generate_budget(payload.architecture, payload.deployment_stack, payload.constraints)


@router.post("/budget-compare", response_model=dict[str, BudgetEstimate])
def budget_compare(payload: BudgetCompareRequest) -> dict[str, BudgetEstimate]:
    """Estimate every shortlisted architecture from one shared constraint set."""
    return {
        architecture.id: generate_budget(
            architecture,
            payload.deployment_stacks.get(architecture.id, []),
            payload.constraints,
        )
        for architecture in payload.architectures
    }
