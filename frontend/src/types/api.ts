export interface Actor {
  name: string
  description: string
}

export interface RequirementModel {
  summary: string
  domain: string
  scale_profile: string
  functional_requirements: string[]
  non_functional_requirements: string[]
  actors: Actor[]
  constraints: string[]
  assumptions: string[]
}

export interface ClarificationQuestion {
  key: string
  category: string
  question: string
  rationale: string
  priority: string
  options: string[]
}

export interface ClarificationPlan {
  completeness_score: number
  missing_areas: string[]
  questions: ClarificationQuestion[]
}

export interface ArchitectureComponent {
  name: string
  responsibility: string
  technologies: string[]
  interactions: string[]
}

export interface ArchitectureOption {
  id: string
  name: string
  style: string
  overview: string
  components: ArchitectureComponent[]
  data_flow: string[]
  technology_stack: string[]
  database: string
  api_style: string
  deployment: string
  advantages: string[]
  disadvantages: string[]
  suitable_scenarios: string[]
  estimated_complexity: string
  estimated_cost: string
  maintenance: string
}

export interface MetricScore {
  metric: string
  score: number
  explanation: string
}

export interface ArchitectureScorecard {
  architecture_id: string
  architecture_name: string
  overall_score: number
  weighted_score: number
  metric_scores: MetricScore[]
  strengths: string[]
  risks: string[]
}

export interface ComparisonResult {
  weights: Record<string, number>
  scorecards: ArchitectureScorecard[]
  reasoning: string[]
}

export interface RecommendationResult {
  recommended_architecture_id: string
  recommended_architecture_name: string
  decision_summary: string
  why: string[]
  why_not: Record<string, string[]>
  rollout_plan: string[]
  confidence: string
}

export interface DiagramArtifact {
  title: string
  description: string
  mermaid: string
  plantuml: string
}

export interface DatabaseField {
  name: string
  data_type: string
  nullable: boolean
  indexed: boolean
  description: string
}

export interface DatabaseEntity {
  name: string
  description: string
  fields: DatabaseField[]
}

export interface DatabaseRelationship {
  source: string
  target: string
  relationship: string
  description: string
}

export interface DatabaseDesign {
  database_engine: string
  entities: DatabaseEntity[]
  relationships: DatabaseRelationship[]
  indexes: string[]
  normalization_notes: string[]
  sql_schema: string
  sample_inserts: string
}

export interface ApiEndpoint {
  method: string
  path: string
  purpose: string
  auth_required: boolean
  request_example: Record<string, unknown>
  response_example: Record<string, unknown>
}

export interface ApiGroup {
  name: string
  description: string
  endpoints: ApiEndpoint[]
}

export interface ApiDesign {
  style: string
  authentication_strategy: string
  groups: ApiGroup[]
  validation_rules: string[]
  openapi_summary: string[]
}

export interface DeploymentPlan {
  deployment_model: string
  target_stack: string[]
  docker_services: string[]
  kubernetes_modules: string[]
  cicd_pipeline: string[]
  observability: string[]
  scaling_strategy: string[]
  security_controls: string[]
  cloud_recommendation: string
}

export interface ImpactAssessment {
  change_request: string
  impacted_modules: string[]
  reasoning: string[]
  regenerated_sections: string[]
}

export interface ArchitectureDecisionRecord {
  id: string
  timestamp: string
  title: string
  context: string
  decision: string
  status: string
  consequences: string
  changed_modules: string[]
}

export interface CriteriaWeights {
  weights: Record<string, number>
}

export interface ReweightRequest {
  matrix: Record<string, Record<string, number>>
  weights: CriteriaWeights
}

export interface ExportAdrsRequest {
  adrs: ArchitectureDecisionRecord[]
}

export interface ComponentStatus {
  component: string
  role: string
  status: 'down' | 'degraded' | 'healthy'
  reason?: string | null
}

export interface BlastRadiusResult {
  failed_component: string
  architecture_id: string
  statuses: ComponentStatus[]
  impact_summary: string
  severity_score: number
}

export interface BlastRadiusRequest {
  architecture: ArchitectureOption
  failed_component: string
  comparison_matrix: Record<string, Record<string, number>>
}

export interface ResilienceRecommendation {
  id: string
  name: string
  category: string
  description: string
  severity_reduction: number
}

export interface ResilienceRecommendationsRequest {
  blast_result: BlastRadiusResult
  architecture: ArchitectureOption
}

export interface ApplyMitigationsRequest {
  blast_result: BlastRadiusResult
  selected_mitigation_ids: string[]
  architecture: ArchitectureOption
}

export interface Workspace {
  id: string
  title: string
  original_prompt: string
  business_context?: string | null
  answers: Record<string, string>
  requirements: RequirementModel
  clarification_plan: ClarificationPlan
  architectures: ArchitectureOption[]
  comparison: ComparisonResult
  recommendation: RecommendationResult
  diagrams: Record<string, DiagramArtifact>
  database_design: DatabaseDesign
  api_design: ApiDesign
  deployment_plan: DeploymentPlan
  documentation_markdown: string
  impact_history: ImpactAssessment[]
  adr?: ArchitectureDecisionRecord | null
  created_at: string
  updated_at: string
}

export interface WorkspaceCreatePayload {
  title: string
  description: string
  business_context?: string
  budget?: string
  preferred_cloud?: string
  constraints: string[]
}

