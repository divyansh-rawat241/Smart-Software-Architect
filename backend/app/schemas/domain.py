from datetime import datetime

from pydantic import BaseModel, Field


class Actor(BaseModel):
    name: str
    description: str


class RequirementModel(BaseModel):
    summary: str
    domain: str
    scale_profile: str
    functional_requirements: list[str] = Field(default_factory=list)
    non_functional_requirements: list[str] = Field(default_factory=list)
    actors: list[Actor] = Field(default_factory=list)
    constraints: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)


class ClarificationQuestion(BaseModel):
    key: str
    category: str
    question: str
    rationale: str
    priority: str
    options: list[str] = Field(default_factory=list)


class ClarificationPlan(BaseModel):
    completeness_score: int
    missing_areas: list[str] = Field(default_factory=list)
    questions: list[ClarificationQuestion] = Field(default_factory=list)


class ArchitectureComponent(BaseModel):
    name: str
    responsibility: str
    technologies: list[str] = Field(default_factory=list)
    interactions: list[str] = Field(default_factory=list)


class ArchitectureOption(BaseModel):
    id: str
    name: str
    style: str
    overview: str
    components: list[ArchitectureComponent] = Field(default_factory=list)
    data_flow: list[str] = Field(default_factory=list)
    technology_stack: list[str] = Field(default_factory=list)
    database: str
    api_style: str
    deployment: str
    advantages: list[str] = Field(default_factory=list)
    disadvantages: list[str] = Field(default_factory=list)
    suitable_scenarios: list[str] = Field(default_factory=list)
    estimated_complexity: str
    estimated_cost: str
    maintenance: str


class MetricScore(BaseModel):
    metric: str
    score: int
    explanation: str


class ArchitectureScorecard(BaseModel):
    architecture_id: str
    architecture_name: str
    overall_score: float
    weighted_score: float
    metric_scores: list[MetricScore] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)


class ComparisonResult(BaseModel):
    weights: dict[str, float] = Field(default_factory=dict)
    scorecards: list[ArchitectureScorecard] = Field(default_factory=list)
    reasoning: list[str] = Field(default_factory=list)


class RecommendationResult(BaseModel):
    recommended_architecture_id: str
    recommended_architecture_name: str
    decision_summary: str
    why: list[str] = Field(default_factory=list)
    why_not: dict[str, list[str]] = Field(default_factory=dict)
    rollout_plan: list[str] = Field(default_factory=list)
    confidence: str


class DiagramArtifact(BaseModel):
    title: str
    description: str
    mermaid: str
    plantuml: str


class DatabaseField(BaseModel):
    name: str
    data_type: str
    nullable: bool = False
    indexed: bool = False
    description: str


class DatabaseEntity(BaseModel):
    name: str
    description: str
    fields: list[DatabaseField] = Field(default_factory=list)


class DatabaseRelationship(BaseModel):
    source: str
    target: str
    relationship: str
    description: str


class DatabaseDesign(BaseModel):
    database_engine: str
    entities: list[DatabaseEntity] = Field(default_factory=list)
    relationships: list[DatabaseRelationship] = Field(default_factory=list)
    indexes: list[str] = Field(default_factory=list)
    normalization_notes: list[str] = Field(default_factory=list)
    sql_schema: str
    sample_inserts: str


class ApiEndpoint(BaseModel):
    method: str
    path: str
    purpose: str
    auth_required: bool
    request_example: dict = Field(default_factory=dict)
    response_example: dict = Field(default_factory=dict)


class ApiGroup(BaseModel):
    name: str
    description: str
    endpoints: list[ApiEndpoint] = Field(default_factory=list)


class ApiDesign(BaseModel):
    style: str
    authentication_strategy: str
    groups: list[ApiGroup] = Field(default_factory=list)
    validation_rules: list[str] = Field(default_factory=list)
    openapi_summary: list[str] = Field(default_factory=list)


class DeploymentPlan(BaseModel):
    deployment_model: str
    target_stack: list[str] = Field(default_factory=list)
    docker_services: list[str] = Field(default_factory=list)
    kubernetes_modules: list[str] = Field(default_factory=list)
    cicd_pipeline: list[str] = Field(default_factory=list)
    observability: list[str] = Field(default_factory=list)
    scaling_strategy: list[str] = Field(default_factory=list)
    security_controls: list[str] = Field(default_factory=list)
    cloud_recommendation: str


class ImpactAssessment(BaseModel):
    change_request: str
    impacted_modules: list[str] = Field(default_factory=list)
    reasoning: list[str] = Field(default_factory=list)
    regenerated_sections: list[str] = Field(default_factory=list)


class WorkspaceCreateRequest(BaseModel):
    title: str
    description: str
    business_context: str | None = None
    budget: str | None = None
    preferred_cloud: str | None = None
    constraints: list[str] = Field(default_factory=list)


class ClarificationAnswerRequest(BaseModel):
    answers: dict[str, str] = Field(default_factory=dict)


class ChangeRequest(BaseModel):
    change_request: str


class WorkspaceResponse(BaseModel):
    id: str
    title: str
    original_prompt: str
    business_context: str | None = None
    answers: dict[str, str] = Field(default_factory=dict)
    requirements: RequirementModel
    clarification_plan: ClarificationPlan
    architectures: list[ArchitectureOption] = Field(default_factory=list)
    comparison: ComparisonResult
    recommendation: RecommendationResult
    diagrams: dict[str, DiagramArtifact] = Field(default_factory=dict)
    database_design: DatabaseDesign
    api_design: ApiDesign
    deployment_plan: DeploymentPlan
    documentation_markdown: str
    impact_history: list[ImpactAssessment] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

