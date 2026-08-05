from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.workspace import Workspace


class WorkspaceRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Workspace]:
        statement = select(Workspace).order_by(Workspace.updated_at.desc())
        return list(self.db.scalars(statement).all())

    def get(self, workspace_id: str) -> Workspace | None:
        return self.db.get(Workspace, workspace_id)

    def add(self, workspace: Workspace) -> Workspace:
        self.db.add(workspace)
        self.db.commit()
        self.db.refresh(workspace)
        return workspace

    def save(self, workspace: Workspace) -> Workspace:
        self.db.add(workspace)
        self.db.commit()
        self.db.refresh(workspace)
        return workspace

