CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  original_prompt TEXT NOT NULL,
  business_context TEXT,
  answers_json JSON NOT NULL DEFAULT '{}',
  requirements_json JSON NOT NULL DEFAULT '{}',
  clarification_json JSON NOT NULL DEFAULT '{}',
  architectures_json JSON NOT NULL DEFAULT '[]',
  comparison_json JSON NOT NULL DEFAULT '{}',
  recommendation_json JSON NOT NULL DEFAULT '{}',
  diagrams_json JSON NOT NULL DEFAULT '{}',
  database_design_json JSON NOT NULL DEFAULT '{}',
  api_design_json JSON NOT NULL DEFAULT '{}',
  deployment_plan_json JSON NOT NULL DEFAULT '{}',
  documentation_markdown TEXT NOT NULL DEFAULT '',
  impact_history_json JSON NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

