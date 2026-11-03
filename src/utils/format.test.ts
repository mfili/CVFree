import { describe, expect, it } from 'vitest'
import { dateRange, fileName, formatDate } from './format'

describe('format helpers', () => {
  it('formats resume dates in Spanish', () => {
    expect(formatDate('2024-01')).toBe('ene 2024')
    expect(dateRange('2022-03', '', true)).toBe('mar 2022 — Actualidad')
    expect(dateRange('2022-03', 'Presente')).toBe('mar 2022 — Actualidad')
  })

  it('ignores malformed resume dates', () => {
    expect(formatDate('invalid')).toBe('')
    expect(formatDate('2024-13')).toBe('')
    expect(dateRange('2024-00', 'invalid')).toBe('')
  })

  it('builds a safe fallback filename', () => {
    expect(fileName('', '')).toBe('Mi-CV')
    expect(fileName('Ana María', 'López')).toBe('CV-Ana-Maria-Lopez')
  })
})