import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatDate } from '../utils/format'

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

interface MonthPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  allowPresent?: boolean
  present?: boolean
  onPresentChange?: (present: boolean) => void
}

export function MonthPicker({ label, value, onChange, allowPresent = false, present = false, onPresentChange }: MonthPickerProps) {
  const initialYear = Number(value.split('-')[0]) || new Date().getFullYear()
  const [year, setYear] = useState(initialYear)
  const [open, setOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open])

  const changeYear = (amount: number) => {
    setYear((current) => Math.min(new Date().getFullYear() + 20, Math.max(1940, current + amount)))
  }

  const selectMonth = (monthIndex: number) => {
    onPresentChange?.(false)
    onChange(`${year}-${String(monthIndex + 1).padStart(2, '0')}`)
    setOpen(false)
  }

  const selectPresent = () => {
    onChange('')
    onPresentChange?.(true)
    setOpen(false)
  }

  return (
    <div className="field month-picker" ref={pickerRef}>
      <span>{label}</span>
      <button
        className={`month-picker__trigger ${present ? 'month-picker__trigger--selected' : ''}`}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{present ? 'Presente' : formatDate(value) || 'Seleccionar'}</span>
        <CalendarDays size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className="month-picker__popover" role="dialog" aria-label={`Seleccionar ${label.toLowerCase()}`}>
          {allowPresent && (
            <button className={`present-option ${present ? 'present-option--active' : ''}`} type="button" onClick={selectPresent}>
              <span>Presente</span>
              <small>Trabajo actual</small>
            </button>
          )}
          <div className="year-control">
            <button type="button" onClick={() => changeYear(-1)} aria-label="Año anterior"><ChevronLeft size={17} /></button>
            <div
              className="year-control__value"
              tabIndex={0}
              aria-label={`Año ${year}. Usa la rueda o las flechas para cambiarlo`}
              onWheel={(event) => {
                event.preventDefault()
                changeYear(event.deltaY > 0 ? 1 : -1)
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') changeYear(-1)
                if (event.key === 'ArrowDown' || event.key === 'ArrowRight') changeYear(1)
              }}
            >
              <small>Año</small>
              <strong>{year}</strong>
              <span>Desliza para cambiar</span>
            </div>
            <button type="button" onClick={() => changeYear(1)} aria-label="Año siguiente"><ChevronRight size={17} /></button>
          </div>
          <div className="month-grid" role="grid" aria-label={`Meses de ${year}`}>
            {months.map((month, index) => {
              const selected = !present && value === `${year}-${String(index + 1).padStart(2, '0')}`
              return <button className={selected ? 'month-grid__month month-grid__month--selected' : 'month-grid__month'} type="button" onClick={() => selectMonth(index)} aria-pressed={selected} key={month}>{month.slice(0, 3)}</button>
            })}
          </div>
        </div>
      )}
    </div>
  )
}