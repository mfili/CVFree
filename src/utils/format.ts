export function formatDate(value: string): string {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return ''
  const year = Number(match[1])
  const month = Number(match[2])
  if (year < 1 || month < 1 || month > 12) return ''
  return new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, 1))
    .replace('.', '')
}

export function dateRange(start: string, end: string, current = false): string {
  const from = formatDate(start)
  const to = current || end === 'Presente' ? 'Actualidad' : formatDate(end)
  return [from, to].filter(Boolean).join(' — ')
}

export function fileName(firstName: string, lastName: string): string {
  const name = `${firstName} ${lastName}`
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .replace(/^-+|-+$/g, '')
  return name ? `CV-${name}` : 'Mi-CV'
}