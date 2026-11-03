import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MonthPicker } from './MonthPicker'

describe('MonthPicker', () => {
  it('shows Spanish months and changes one visible year with the mouse wheel', async () => {
    const user = userEvent.setup()
    const currentYear = new Date().getFullYear()
    render(<MonthPicker label="Fecha de inicio" value="" onChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Seleccionar' }))
    expect(screen.getByRole('button', { name: 'Ene' })).toBeInTheDocument()
    expect(screen.getByText(String(currentYear))).toBeInTheDocument()

    fireEvent.wheel(screen.getByLabelText(new RegExp(`Año ${currentYear}`)), { deltaY: 100 })
    expect(screen.getByText(String(currentYear + 1))).toBeInTheDocument()
    expect(screen.queryByText(String(currentYear - 1))).not.toBeInTheDocument()
  })

  it('selects Presente from the end-date calendar', async () => {
    const user = userEvent.setup()
    const onPresentChange = vi.fn()
    render(<MonthPicker label="Fecha de finalización" value="" onChange={vi.fn()} allowPresent onPresentChange={onPresentChange} />)

    await user.click(screen.getByRole('button', { name: 'Seleccionar' }))
    await user.click(screen.getByRole('button', { name: /Presente/ }))

    expect(onPresentChange).toHaveBeenCalledWith(true)
  })
})