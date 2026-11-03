import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { getTemplate } from '../data/templates'
import type { ResumeData } from '../types'
import { dateRange, fileName } from './format'

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const binary = atob(dataUrl.split(',')[1])
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

const bodyText = (text: string, bold = false, keepNext = false) =>
  new Paragraph({
    children: [new TextRun({ text, bold, size: 20, color: '30312F' })],
    spacing: { after: 100 },
    keepLines: true,
    keepNext,
  })

const sectionTitle = (text: string, color: string) =>
  new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, color })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    border: { bottom: { color, size: 8, style: 'single' } },
    keepNext: true,
  })

export async function exportDocx(data: ResumeData) {
  const children: Paragraph[] = []
  const template = getTemplate(data.template)
  const accentColor = template.accent.slice(1).toUpperCase()
  const inkColor = template.ink.slice(1).toUpperCase()
  const fullName = `${data.personal.firstName} ${data.personal.lastName}`.trim() || 'Tu nombre'

  if (data.personal.photo) {
    const imageType: 'png' | 'jpg' = data.personal.photo.startsWith('data:image/png') ? 'png' : 'jpg'
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new ImageRun({ data: dataUrlToBytes(data.personal.photo), transformation: { width: 100, height: 100 }, type: imageType })],
      spacing: { after: 160 },
    }))
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: fullName, bold: true, size: 38, color: inkColor })],
      spacing: { after: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: [data.personal.email, data.personal.phone, [data.personal.city, data.personal.country].filter(Boolean).join(', '), data.personal.linkedin].filter(Boolean).join('  ·  '), size: 18, color: '626560' })],
      spacing: { after: 240 },
    }),
  )

  if (data.personal.profile) children.push(sectionTitle('Perfil', accentColor), bodyText(data.personal.profile))

  const experiences = data.experiences.filter((item) => item.role || item.company || item.description)
  if (experiences.length) {
    children.push(sectionTitle('Experiencia', accentColor))
    experiences.forEach((item) => children.push(
      bodyText(`${item.role || 'Puesto'} · ${item.company}${dateRange(item.startDate, item.endDate, item.current) ? `  |  ${dateRange(item.startDate, item.endDate, item.current)}` : ''}`, true, true),
      bodyText(item.description),
    ))
  }

  const education = data.education.filter((item) => item.institution || item.degree)
  if (education.length) {
    children.push(sectionTitle('Educación', accentColor))
    education.forEach((item) => children.push(
      bodyText(`${item.degree || 'Grado'} · ${item.institution}`, true, Boolean(dateRange(item.startDate, item.endDate))),
      bodyText(dateRange(item.startDate, item.endDate)),
    ))
  }

  const courses = data.courses.filter((item) => item.name || item.issuer)
  if (courses.length) {
    children.push(sectionTitle('Cursos', accentColor))
    courses.forEach((item) => children.push(bodyText(`${item.name}${item.issuer ? ` · ${item.issuer}` : ''}`, true)))
  }

  const languages = data.languages.filter((item) => item.name || item.level)
  if (languages.length) {
    children.push(sectionTitle('Idiomas', accentColor))
    languages.forEach((item) => children.push(bodyText(`${item.name}${item.level ? ` · ${item.level}` : ''}`)))
  }

  data.customSections.filter((item) => item.description).forEach((item) => {
    children.push(sectionTitle(item.title || 'Información adicional', accentColor), bodyText(item.description))
  })

  const documentFile = new Document({
    styles: {
      default: { document: { run: { font: 'Aptos', size: 20 } } },
      paragraphStyles: [{ id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', run: { font: 'Aptos Display', bold: true, size: 24, color: inkColor } }],
    },
    sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children }],
  })

  download(await Packer.toBlob(documentFile), `${fileName(data.personal.firstName, data.personal.lastName)}.docx`)
}

export interface PageBlock {
  top: number
  bottom: number
}

export function calculatePageStarts(canvasHeight: number, pageHeight: number, blocks: PageBlock[], subsequentTopMargin = 0): number[] {
  if (canvasHeight <= 0 || pageHeight <= 0) return [0]

  const starts = [0]
  while (true) {
    const currentStart = starts[starts.length - 1]
    const availableHeight = pageHeight - (starts.length > 1 ? subsequentTopMargin : 0)
    const target = currentStart + availableHeight
    if (target >= canvasHeight) break

    const crossingBlock = blocks.find((block) =>
      block.top < target &&
      block.bottom > target &&
      block.bottom - block.top <= availableHeight,
    )
    const nextStart = crossingBlock?.top ?? target
    if (nextStart <= currentStart) break
    starts.push(nextStart)
  }

  return starts
}

export function collectPageBlocks(element: HTMLElement, pixelsPerCssPixel: number): PageBlock[] {
  const toPixels = (top: number, bottom: number): PageBlock => ({
    top: (top - element.getBoundingClientRect().top) * pixelsPerCssPixel,
    bottom: (bottom - element.getBoundingClientRect().top) * pixelsPerCssPixel,
  })

  return Array.from(element.querySelectorAll<HTMLElement>('.resume-section')).flatMap((section) => {
    const sectionRect = section.getBoundingClientRect()
    const content = section.querySelector<HTMLElement>(':scope > .resume-section__content')
    const entries = content ? Array.from(content.children) as HTMLElement[] : []
    if (entries.length <= 1) {
      return [toPixels(sectionRect.top, sectionRect.bottom)]
    }

    const firstEntry = entries[0]
    const blocks: PageBlock[] = []
    const firstEntryRect = firstEntry.getBoundingClientRect()
    blocks.push(toPixels(sectionRect.top, firstEntryRect.bottom))
    blocks.push(...entries.slice(1).map((entry) => {
      const rect = entry.getBoundingClientRect()
      return toPixels(rect.top, rect.bottom)
    }))
    return blocks
  })
}

export async function exportPdf(element: HTMLElement, data: ResumeData) {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const pageHeight = 297
  const subsequentTopMargin = 12
  const imageHeight = (canvas.height * pageWidth) / canvas.width
  const image = canvas.toDataURL('image/jpeg', 0.96)
  const pixelPageHeight = (canvas.width * pageHeight) / pageWidth
  const pixelTopMargin = (canvas.width * subsequentTopMargin) / pageWidth
  const elementRect = element.getBoundingClientRect()
  const pixelsPerCssPixel = canvas.height / elementRect.height
  const blocks = collectPageBlocks(element, pixelsPerCssPixel)
  const pageStarts = calculatePageStarts(canvas.height, pixelPageHeight, blocks, pixelTopMargin)

  pageStarts.forEach((offset, index) => {
    if (index > 0) pdf.addPage()
    const topMargin = index > 0 ? subsequentTopMargin : 0
    const offsetMm = (offset * pageWidth) / canvas.width
    pdf.addImage(image, 'JPEG', 0, topMargin - offsetMm, pageWidth, imageHeight)
    if (topMargin) {
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageWidth, topMargin, 'F')
    }

    const nextOffset = pageStarts[index + 1]
    if (nextOffset !== undefined && nextOffset < offset + pixelPageHeight - (index > 0 ? pixelTopMargin : 0)) {
      const visibleBottomMm = topMargin + ((nextOffset - offset) * pageWidth) / canvas.width
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, visibleBottomMm, pageWidth, pageHeight - visibleBottomMm, 'F')
    }
  })

  pdf.save(`${fileName(data.personal.firstName, data.personal.lastName)}.pdf`)
}