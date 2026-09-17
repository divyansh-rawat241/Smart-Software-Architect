import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ArchitectureFlow } from './ArchitectureFlow'

describe('ArchitectureFlow', () => {
  it('links each component to its causal explanation', () => {
    render(
      <MemoryRouter>
        <ArchitectureFlow
          architecture={{
            id: 'modular',
            name: 'Modular option',
            style: 'Modular',
            overview: 'One deployable with internal boundaries.',
            components: [
              {
                name: 'Observation Core',
                responsibility: 'Owns observation workflows.',
                technologies: ['Python'],
                interactions: [],
              },
            ],
            data_flow: [],
            technology_stack: ['Python'],
            database: 'Relational database',
            api_style: 'REST',
            deployment: 'Containers',
            advantages: [],
            disadvantages: [],
            suitable_scenarios: [],
            estimated_complexity: 'Medium',
            estimated_cost: 'Low',
            maintenance: 'Moderate',
          }}
          whyHref={(component) => `/causal-graph?component=${component.name}`}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /why does this exist/i })).toHaveAttribute(
      'href',
      '/causal-graph?component=Observation Core',
    )
  })

  it('labels components CMP-001 style and reports the row index to row actions', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onAsk = vi.fn()
    const { container } = render(
      <MemoryRouter>
        <ArchitectureFlow
          architecture={{
            id: 'modular',
            name: 'Modular option',
            style: 'Modular',
            overview: 'One deployable with internal boundaries.',
            components: [
              {
                name: 'Observation Core',
                responsibility: 'Owns observation workflows.',
                technologies: [],
                interactions: [],
              },
              {
                name: 'Sync Worker',
                responsibility: 'Replicates state.',
                technologies: [],
                interactions: [],
              },
            ],
            data_flow: [],
            technology_stack: [],
            database: 'Relational database',
            api_style: 'REST',
            deployment: 'Containers',
            advantages: [],
            disadvantages: [],
            suitable_scenarios: [],
            estimated_complexity: 'Medium',
            estimated_cost: 'Low',
            maintenance: 'Moderate',
          }}
          onEdit={onEdit}
          onDelete={onDelete}
          onAsk={onAsk}
        />
      </MemoryRouter>,
    )

    // Badge matches the COMPONENT-001 target ids used by edit/delete/ask.
    expect(screen.getByText('CMP-001')).toBeInTheDocument()
    expect(screen.getByText('CMP-002')).toBeInTheDocument()

    // Actions sit in a trailing column of their own row, never inside the
    // content flow, so every row's buttons align identically.
    expect(container.querySelectorAll('.editor-row > .row-actions')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Edit Sync Worker' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit.mock.calls[0][0].name).toBe('Sync Worker')
    expect(onEdit.mock.calls[0][1]).toBe(1)

    fireEvent.click(screen.getByRole('button', { name: 'Delete Sync Worker' }))
    expect(onDelete.mock.calls[0][1]).toBe(1)

    fireEvent.click(screen.getByRole('button', { name: 'Ask AI about Sync Worker' }))
    expect(onAsk.mock.calls[0][1]).toBe(1)
  })
})
