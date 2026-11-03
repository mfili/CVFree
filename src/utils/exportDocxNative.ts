import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { getTemplate } from '../data/templates'
import type { ResumeData } from '../types'
import { dateRange, fileName } from './format'

const bodyParagraph = (text: string, bold = false, keepNext = false) =>
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

export async function exportNativeDocx(data: ResumeData) {
  const children: Paragraph[] = []
  const template = getTemplate(data.template)
  const accentColor = template.accent.slice(1).toUpperCase()
  const inkColor = template.ink.slice(1).toUpperCase()
  const fullName = `${data.personal.firstName} ${data.personal.lastName}`.trim() || 'Tu nombre'
  const contact = [
    data.personal.email,
    data.personal.phone,
    [data.personal.city, data.personal.country].filter(Boolean).join(', '),
    data.personal.linkedin,
  ].filter(Boolean).join('  ·  ')

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: fullName, bold: true, size: 38, color: inkColor })],
      spacing: { after: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: contact, size: 18, color: '626560' })],
      spacing: { after: 240 },
    }),
  )

  if (data.personal.profile) children.push(sectionTitle('Perfil', accentColor), bodyParagraph(data.personal.profile))

  const experiences = data.experiences.filter((item) => item.role || item.company || item.description)
  if (experiences.length) {
    children.push(sectionTitle('Experiencia', accentColor))
    experiences.forEach((item) => {
      const dates = dateRange(item.startDate, item.endDate, item.current)
      children.push(
        bodyParagraph(`${item.role || 'Puesto'}${item.company ? ` · ${item.company}` : ''}${dates ? `  |  ${dates}` : ''}`, true, true),
        bodyParagraph(item.description),
      )
    })
  }

  const education = data.education.filter((item) => item.institution || item.degree)
  if (education.length) {
    children.push(sectionTitle('Educación', accentColor))
    education.forEach((item) => {
      const dates = dateRange(item.startDate, item.endDate)
      children.push(
        bodyParagraph(`${item.degree || 'Grado'}${item.institution ? ` · ${item.institution}` : ''}`, true, Boolean(dates)),
        ...(dates ? [bodyParagraph(dates)] : []),
      )
    })
  }

  const courses = data.courses.filter((item) => item.name || item.issuer)
  if (courses.length) {
    children.push(sectionTitle('Cursos', accentColor))
    courses.forEach((item) => children.push(bodyParagraph(`${item.name}${item.issuer ? ` · ${item.issuer}` : ''}`, true)))
  }

  const languages = data.languages.filter((item) => item.name || item.level)
  if (languages.length) {
    children.push(sectionTitle('Idiomas', accentColor))
    languages.forEach((item) => children.push(bodyParagraph(`${item.name}${item.level ? ` · ${item.level}` : ''}`)))
  }

  data.customSections.filter((item) => item.description).forEach((item) => {
    children.push(sectionTitle(item.title || 'Información adicional', accentColor), bodyParagraph(item.description))
  })

  const documentFile = new Document({
    styles: {
      default: { document: { run: { font: 'Aptos', size: 20 } } },
      paragraphStyles: [{ id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', run: { font: 'Aptos Display', bold: true, size: 24, color: inkColor } }],
    },
    sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children }],
  })

  const cacheDirectory = FileSystem.cacheDirectory
  if (!cacheDirectory) throw new Error('No está disponible el almacenamiento temporal del dispositivo.')
  if (!(await Sharing.isAvailableAsync())) throw new Error('No está disponible el menú para compartir archivos.')

  const uri = `${cacheDirectory}${fileName(data.personal.firstName, data.personal.lastName)}.docx`
  const base64 = await Packer.toBase64String(documentFile)
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 })
  await Sharing.shareAsync(uri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    dialogTitle: 'Compartir currículum',
  })
}