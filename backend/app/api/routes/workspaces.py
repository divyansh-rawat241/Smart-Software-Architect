from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.domain import (
    ChangeRequest,
    ClarificationAnswerRequest,
    WorkspaceCreateRequest,
    WorkspaceResponse,
)
from app.services.workspace_orchestrator import WorkspaceOrchestrator

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


def get_orchestrator(db: Session = Depends(get_db)) -> WorkspaceOrchestrator:
    repository = WorkspaceRepository(db)
    return WorkspaceOrchestrator(repository)


@router.get("", response_model=list[WorkspaceResponse])
def list_workspaces(
    orchestrator: WorkspaceOrchestrator = Depends(get_orchestrator),
) -> list[WorkspaceResponse]:
    return orchestrator.list_workspaces()


@router.post("", response_model=WorkspaceResponse, status_code=201)
def create_workspace(
    payload: WorkspaceCreateRequest,
    orchestrator: WorkspaceOrchestrator = Depends(get_orchestrator),
) -> WorkspaceResponse:
    return orchestrator.create_workspace(payload)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(
    workspace_id: str,
    orchestrator: WorkspaceOrchestrator = Depends(get_orchestrator),
) -> WorkspaceResponse:
    workspace = orchestrator.get_workspace(workspace_id)
    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.post("/{workspace_id}/clarifications", response_model=WorkspaceResponse)
def answer_clarifications(
    workspace_id: str,
    payload: ClarificationAnswerRequest,
    orchestrator: WorkspaceOrchestrator = Depends(get_orchestrator),
) -> WorkspaceResponse:
    workspace = orchestrator.answer_clarifications(workspace_id, payload.answers)
    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.post("/{workspace_id}/changes", response_model=WorkspaceResponse)
def apply_change_request(
    workspace_id: str,
    payload: ChangeRequest,
    orchestrator: WorkspaceOrchestrator = Depends(get_orchestrator),
) -> WorkspaceResponse:
    workspace = orchestrator.apply_change_request(workspace_id, payload.change_request)
    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.get("/{workspace_id}/documentation/markdown", response_class=PlainTextResponse)
def download_markdown(
    workspace_id: str,
    orchestrator: WorkspaceOrchestrator = Depends(get_orchestrator),
) -> str:
    workspace = orchestrator.get_workspace(workspace_id)
    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace.documentation_markdown


@router.get("/{workspace_id}/documentation/pdf")
def download_pdf(
    workspace_id: str,
    orchestrator: WorkspaceOrchestrator = Depends(get_orchestrator),
) -> Response:
    pdf_bytes = orchestrator.export_pdf(workspace_id)
    if pdf_bytes is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="archai-{workspace_id}.pdf"'
        },
    )

