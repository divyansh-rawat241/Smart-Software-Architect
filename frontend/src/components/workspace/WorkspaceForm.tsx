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
    <form className="panel" onSubmit={handleSubmit}>
      <div className="mb-4">
        <h3 className="section-title">Project brief</h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Enter the brief once and ArchAI will generate the workspace.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Project title</span>
          <input
            required
            value={values.title}
            onChange={(event) => updateField('title', event.target.value)}
            className="input-shell"
            placeholder="VoltReserve, MediBridge, CampusFlow..."
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Project brief</span>
          <textarea
            required
            rows={5}
            value={values.description}
            onChange={(event) => updateField('description', event.target.value)}
            className="input-shell"
            placeholder="Build an EV charging station booking platform with live availability..."
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Business context</span>
          <textarea
            rows={3}
            value={values.business_context}
            onChange={(event) => updateField('business_context', event.target.value)}
            className="input-shell"
            placeholder="Launch urgency, regional rollout, compliance pressure..."
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Budget</span>
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

          <label className="block space-y-1">
            <span className="text-sm font-medium">Cloud</span>
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

        <label className="block space-y-1">
          <span className="text-sm font-medium">Constraints</span>
          <input
            value={values.constraints}
            onChange={(event) => updateField('constraints', event.target.value)}
            className="input-shell"
            placeholder="PCI-aware checkout, must use PostgreSQL, SSO required..."
          />
        </label>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={loadSampleProject}
          className="button-secondary text-sm"
        >
          Load Sample
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="button-brand"
        >
          {isPending ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </form>
  )
}
