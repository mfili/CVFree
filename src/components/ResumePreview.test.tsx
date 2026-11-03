import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { initialResume } from '../data/initialResume'
import { templates } from '../data/templates'
import { ResumePreview } from './ResumePreview'

describe('ResumePreview templates', () => {
  it.each(templates)('applies the $name design to edited resume data', (template) => {
    const data = {
      ...initialResume,
      template: template.id,
      personal: {
        ...initialResume.personal,
        firstName: 'Ada',
        lastName: 'Lovelace',
        profile: 'Perfil editado',
      },
    }
    const { container } = render(<ResumePreview data={data} />)
    const preview = container.querySelector('article.resume')

    expect(preview).toHaveClass(`resume--${template.id}`)
    expect(preview).toHaveClass(`resume--layout-${template.layout}`)
    expect(screen.getByRole('heading', { level: 1, name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(screen.getByText('Perfil editado')).toBeInTheDocument()
  })
})