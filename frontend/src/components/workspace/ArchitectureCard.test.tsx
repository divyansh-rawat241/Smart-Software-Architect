import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ArchitectureCard } from './ArchitectureCard'

describe('ArchitectureCard', () => {
  it('renders the architecture name and advantages', () => {
    render(
      <ArchitectureCard
        architecture={{
          id: 'modular-monolith',
          name: 'Modular Monolith',
          style: 'Layered',
          overview: 'A cohesive deployable unit with strong internal boundaries.',
          components: [],
          data_flow: [],
          technology_stack: [],
          database: 'PostgreSQL',
          api_style: 'REST',
          deployment: 'Containers',
          advantages: ['Fastest delivery path'],
          disadvantages: ['Lower isolation'],
          suitable_scenarios: ['Single team'],
          estimated_complexity: 'Medium',
          estimated_cost: 'Low',
          maintenance: 'Straightforward',
        }}
        recommended
      />,
    )

    expect(screen.getByText(/modular monolith/i)).toBeInTheDocument()
    expect(screen.getByText(/fastest delivery path/i)).toBeInTheDocument()
  })
})
