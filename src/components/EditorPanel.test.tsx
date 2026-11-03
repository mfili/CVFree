import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { initialResume } from '../data/initialResume'
import type { ResumeData } from '../types'
import { EditorPanel } from './EditorPanel'

function TestEditor() {
  const [data, setData] = useState<ResumeData>(initialResume)
  return <EditorPanel data={data} setData={setData} />
}

describe('EditorPanel', () => {
  it('edits the personal phone number', async () => {
    const user = userEvent.setup()
    render(<TestEditor />)

    await user.type(screen.getByLabelText('Teléfono'), '+57 300 123 4567')

    expect(screen.getByLabelText('Teléfono')).toHaveValue('+57 300 123 4567')
  })

  it('adds as many work experiences as needed', async () => {
    const user = userEvent.setup()
    render(<TestEditor />)

    expect(screen.getByText('Experiencia 1')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Agregar experiencia' }))

    expect(screen.getByText('Experiencia 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Eliminar experiencia 2')).toBeInTheDocument()
  })
})