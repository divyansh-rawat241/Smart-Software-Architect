"""Lightweight analysis endpoints for the What-If Playground, ADR export,
and Blast Radius Simulator with resilience recommendations.

These endpoints are intentionally stateless and fast — they accept the
full payload from the client and return computed results without any
LLM calls or database writes. The reweight endpoint is called on every
slider drag so it must respond in milliseconds.
"""

import io
import zipfile
from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.domain import (
    ArchitectureDecisionRecord,
    ArchitectureScorecard,
    ApplyMitigationsRequest,
    BlastRadiusRequest,
    BlastRadiusResult,
    ExportAdrsRequest,
    ResilienceRecommendation,
    ResilienceRecommendationsRequest,
    ReweightRequest,
)
from app.services.blast_radius_engine import (
    apply_mitigations,
    simulate_failure,
    suggest_mitigations,
)
from app.services.comparison_engine import recompute_with_weights

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/reweight", response_model=list[ArchitectureScorecard])
def reweight(payload: ReweightRequest) -> list[ArchitectureScorecard]:
    """Recompute architecture rankings with user-specified criterion weights.

    Pure computation — no LLM, no DB, no re-analysis. The client sends
    the cached score matrix and the current slider weights; the server
    returns re-sorted ArchitectureScorecards.
    """
    return recompute_with_weights(payload.matrix, payload.weights)


@router.post("/export-adrs")
def export_adrs(payload: ExportAdrsRequest) -> StreamingResponse:
    """Export a list of ArchitectureDecisionRecords as a zip of markdown files.

    Each ADR is formatted using the standard template:
    Title / Status / Context / Decision / Consequences.
    """
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for adr in payload.adrs:
            md = _render_adr_markdown(adr)
            filename = f"adr-{adr.id}.md"
            zf.writestr(filename, md)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=architecture-decision-records.zip"},
    )


def _render_adr_markdown(adr: ArchitectureDecisionRecord) -> str:
    """Render a single ADR into the standard markdown template."""
    lines = [
        f"# {adr.title}",
        "",
        f"**Status:** {adr.status}",
        "",
        f"**Date:** {adr.timestamp}",
        "",
        "## Context",
        "",
        adr.context,
        "",
        "## Decision",
        "",
        adr.decision,
        "",
        "## Consequences",
        "",
        adr.consequences,
        "",
    ]
    if adr.changed_modules:
        lines.append("**Changed modules:** " + ", ".join(adr.changed_modules))
        lines.append("")
    return "\n".join(lines)


@router.post("/blast-radius", response_model=BlastRadiusResult)
def blast_radius(payload: BlastRadiusRequest) -> BlastRadiusResult:
    """Simulate a component failure and return the blast radius.

    Pure deterministic computation — no LLM, no DB. The client sends
    the architecture definition, the failed component name, and the
    comparison matrix (for fault_isolation scoring). The server returns
    per-component status and a severity score.
    """
    return simulate_failure(
        architecture=payload.architecture,
        failed_component=payload.failed_component,
        comparison_matrix=payload.comparison_matrix,
    )


@router.post("/resilience-recommendations", response_model=list[ResilienceRecommendation])
def resilience_recommendations(payload: ResilienceRecommendationsRequest) -> list[ResilienceRecommendation]:
    """Return deterministic mitigation suggestions for a blast radius result.

    Pure rule-based computation — no LLM. The client sends the completed
    blast radius result and the architecture it was simulated against.
    The server filters the MITIGATION_CATALOG to entries that would
    meaningfully reduce the observed blast radius.
    """
    return suggest_mitigations(
        blast_result=payload.blast_result,
        architecture=payload.architecture,
    )


@router.post("/blast-radius/apply-mitigations", response_model=BlastRadiusResult)
def apply_mitigations_endpoint(payload: ApplyMitigationsRequest) -> BlastRadiusResult:
    """Apply selected mitigations and return a modified blast radius result.

    Pure deterministic computation — no LLM. The client sends the original
    blast radius result, a list of selected mitigation IDs, and the
    architecture. The server applies status transformations and recomputes
    the severity score.
    """
    return apply_mitigations(
        blast_result=payload.blast_result,
        selected_mitigation_ids=payload.selected_mitigation_ids,
        architecture=payload.architecture,
    )
