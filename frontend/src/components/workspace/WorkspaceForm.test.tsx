import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { sampleProject } from '../../lib/sampleProject'
import { WorkspaceForm } from './WorkspaceForm'

describe('WorkspaceForm', () => {
  it('submits a parsed workspace payload', () => {
    const handleSubmit = vi.fn()

    render(<WorkspaceForm isPending={false} onSubmit={handleSubmit} />)

    fireEvent.change(screen.getByLabelText(/project title/i), {
      target: { value: 'ArchAI Demo' },
    })
    fireEvent.change(screen.getByLabelText(/project brief/i), {
      target: { value: 'Build a learning platform for 50,000 users.' },
    })
    fireEvent.change(screen.getByLabelText(/explicit constraints/i), {
      target: { value: 'SSO, PostgreSQL' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /generate workspace/i }),
    )

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'ArchAI Demo',
        constraints: ['SSO', 'PostgreSQL'],
      }),
    )
  })

  it('loads the sample project brief', () => {
    render(<WorkspaceForm isPending={false} onSubmit={vi.fn()} />)

    fireEvent.click(
      screen.getAllByRole('button', { name: /load sample brief/i })[0],
    )

    expect(screen.getByLabelText(/project title/i)).toHaveValue(
      sampleProject.title,
    )
    expect(screen.getByLabelText(/project brief/i)).toHaveValue(
      sampleProject.description,
    )
  })
})
