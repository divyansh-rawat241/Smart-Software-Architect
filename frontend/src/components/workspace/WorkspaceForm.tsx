import { useState, type FormEvent } from 'react'
import { sampleProject } from '../../lib/sampleProject'
import type { WorkspaceCreatePayload } from '../../types/api'

interface WorkspaceFormProps {
  isPending: boolean
  onSubmit: (payload: WorkspaceCreatePayload) => void
}

const initialValues = {
  title: '',
  description: '',
  business_context: '',
  budget: 'medium',
  preferred_cloud: 'AWS',
  constraints: '',
}

export function WorkspaceForm({ isPending, onSubmit }: WorkspaceFormProps) {
  const [values, setValues] = useState(initialValues)

  function updateField(field: keyof typeof initialValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      business_context: values.business_context.trim(),
      budget: values.budget,
      preferred_cloud: values.preferred_cloud,
      constraints: values.constraints
        .split(',')
        .map((constraint) => constraint.trim())
        .filter(Boolean),
    })
  }

  function loadSampleProject() {
    setValues({
      title: sampleProject.title,
      description: sampleProject.description,
      business_context: sampleProject.business_context ?? '',
      budget: sampleProject.budget ?? 'medium',
      preferred_cloud: sampleProject.preferred_cloud ?? 'AWS',
      constraints: sampleProject.constraints.join(', '),
    })
  }

  return (
    <form className="panel-strong animate-rise relative overflow-hidden" onSubmit={handleSubmit}>
      <div className="absolute -right-12 top-0 h-44 w-44 rounded-full bg-[var(--brand-soft)] blur-3xl" />
      <div className="relative flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="pill">Phase 1</p>
          <h3 className="mt-3 section-title">Project brief</h3>
        </div>
        <p className="max-w-xl text-sm leading-7 text-muted">
          Enter the brief once. ArchAI will generate the workspace and guide the next step automatically.
        </p>
      </div>

      <div className="relative mt-8 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold">Project title</span>
          <input
            required
            value={values.title}
            onChange={(event) => updateField('title', event.target.value)}
            className="input-shell"
            placeholder="VoltReserve, MediBridge, CampusFlow..."
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold">Project brief</span>
          <textarea
            required
            rows={6}
            value={values.description}
            onChange={(event) => updateField('description', event.target.value)}
            className="input-shell"
            placeholder="Build an EV charging station booking platform with live availability, slot reservations, payments, and operator controls."
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold">Business context</span>
          <textarea
            rows={4}
            value={values.business_context}
            onChange={(event) => updateField('business_context', event.target.value)}
            className="input-shell"
            placeholder="Launch urgency, regional rollout, operating model, compliance pressure, stakeholder expectations..."
          />
        </label>

        <div className="grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-semibold">Budget posture</span>
            <select
              value={values.budget}
              onChange={(event) => updateField('budget', event.target.value)}
              className="input-shell"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold">Preferred cloud</span>
            <select
              value={values.preferred_cloud}
              onChange={(event) => updateField('preferred_cloud', event.target.value)}
              className="input-shell"
            >
              <option value="AWS">AWS</option>
              <option value="Azure">Azure</option>
              <option value="GCP">GCP</option>
              <option value="On-premise">On-premise</option>
              <option value="No preference">No preference</option>
            </select>
          </label>
        </div>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold">Explicit constraints</span>
          <input
            value={values.constraints}
            onChange={(event) => updateField('constraints', event.target.value)}
            className="input-shell"
            placeholder="PCI-aware checkout, geospatial search, must use PostgreSQL, SSO required..."
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-sm leading-7 text-muted">
          A concise brief is enough to start.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadSampleProject}
            className="button-secondary"
          >
            Load Sample Brief
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="button-brand"
          >
            {isPending ? 'Generating...' : 'Generate Workspace'}
          </button>
        </div>
      </div>
    </form>
  )
}
