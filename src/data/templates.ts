import type { TemplateId } from '../types'

export type TemplateLayout =
  | 'editorial'
  | 'banner'
  | 'classic'
  | 'rail'
  | 'minimal'
  | 'top-band'
  | 'centered'
  | 'split'
  | 'compact'
  | 'modern'
  | 'monochrome'
  | 'columns'

export interface TemplateOption {
  id: TemplateId
  name: string
  description: string
  layout: TemplateLayout
  accent: string
  ink: string
}

export const templates: TemplateOption[] = [
  { id: 'atlas', name: 'Atlas', description: 'Editorial y cálida', layout: 'editorial', accent: '#c66243', ink: '#183c3a' },
  { id: 'norte', name: 'Norte', description: 'Moderna y precisa', layout: 'banner', accent: '#c66243', ink: '#173c3a' },
  { id: 'clasica', name: 'Clásica', description: 'Sobria y atemporal', layout: 'classic', accent: '#51534f', ink: '#2d2e2b' },
  { id: 'plantilla-1', name: 'Diseño 1', description: 'Columna editorial', layout: 'rail', accent: '#009892', ink: '#173b3a' },
  { id: 'plantilla-2', name: 'Diseño 2', description: 'Minimalista', layout: 'minimal', accent: '#43566b', ink: '#1c2936' },
  { id: 'plantilla-3', name: 'Diseño 3', description: 'Banda superior', layout: 'top-band', accent: '#0f766e', ink: '#164e63' },
  { id: 'plantilla-4', name: 'Diseño 4', description: 'Perfil centrado', layout: 'centered', accent: '#ae5c42', ink: '#34312f' },
  { id: 'plantilla-5', name: 'Diseño 5', description: 'Estructura dividida', layout: 'split', accent: '#1f7182', ink: '#223a48' },
  { id: 'plantilla-6', name: 'Diseño 6', description: 'Editorial verde', layout: 'editorial', accent: '#788b68', ink: '#374337' },
  { id: 'plantilla-7', name: 'Diseño 7', description: 'Clásica compacta', layout: 'compact', accent: '#a1543c', ink: '#282828' },
  { id: 'plantilla-8', name: 'Diseño 8', description: 'Moderna geométrica', layout: 'modern', accent: '#487f74', ink: '#183c3a' },
  { id: 'plantilla-9', name: 'Diseño 9', description: 'Monocromática', layout: 'monochrome', accent: '#636363', ink: '#222222' },
  { id: 'plantilla-11', name: 'Diseño 11', description: 'Encabezado oscuro', layout: 'banner', accent: '#cf684c', ink: '#262b31' },
  { id: 'plantilla-12', name: 'Diseño 12', description: 'Dos columnas', layout: 'columns', accent: '#0b7278', ink: '#203c3b' },
]

export function getTemplate(id: TemplateId) {
  return templates.find((template) => template.id === id) ?? templates[0]
}