import type { ResumeData } from '../types'
import { getTemplate } from '../data/templates'
import { dateRange } from './format'

function htmlEscape(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character] ?? character)
}

export function buildNativeResumeHtml(data: ResumeData, photoDataUri?: string) {
  const template = getTemplate(data.template)
  const name = `${data.personal.firstName} ${data.personal.lastName}`.trim() || 'Tu nombre'
  const paragraph = (text: string) => `<p>${htmlEscape(text).replace(/\n/g, '<br>')}</p>`
  const section = (title: string, content: string) => content
    ? `<section class="resume-section"><h2>${htmlEscape(title)}</h2><div class="resume-section-content">${content}</div></section>`
    : ''
  const experiences = data.experiences
    .filter((item) => item.role || item.company || item.description)
    .map((item) => {
      const dates = dateRange(item.startDate, item.endDate, item.current)
      return `<article class="resume-entry"><h3>${htmlEscape(item.role || 'Puesto')}</h3>${item.company ? `<strong>${htmlEscape(item.company)}</strong>` : ''}${dates ? `<time>${htmlEscape(dates)}</time>` : ''}${item.description ? paragraph(item.description) : ''}</article>`
    })
    .join('')
  const education = data.education
    .filter((item) => item.institution || item.degree)
    .map((item) => {
      const dates = dateRange(item.startDate, item.endDate)
      return `<article class="resume-entry"><h3>${htmlEscape(item.degree || 'Grado')}</h3>${item.institution ? `<strong>${htmlEscape(item.institution)}</strong>` : ''}${dates ? `<time>${htmlEscape(dates)}</time>` : ''}</article>`
    })
    .join('')
  const courses = data.courses
    .filter((item) => item.name || item.issuer)
    .map((item) => `<article class="resume-entry"><strong>${htmlEscape(item.name)}</strong>${item.issuer ? paragraph(item.issuer) : ''}</article>`)
    .join('')
  const languages = data.languages
    .filter((item) => item.name || item.level)
    .map((item) => `<article class="resume-entry"><strong>${htmlEscape(item.name)}</strong>${item.level ? paragraph(item.level) : ''}</article>`)
    .join('')
  const customSections = data.customSections
    .filter((item) => item.description)
    .map((item) => section(item.title || 'Información adicional', paragraph(item.description)))
    .join('')
  const contactIcons = {
    email: '<path d="m4 4 8 7 8-7"/><rect x="3" y="4" width="18" height="16" rx="2"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.7L7.1 10.3a16 16 0 0 0 6 6l1.9-1.9a2 2 0 0 1 1.7-.6l3 .5a2 2 0 0 1 1.3 2.6z"/>',
    address: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-6h-4v6H4a1 1 0 0 1-1-1z"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  }
  const contactItem = (icon: keyof typeof contactIcons, value: string) =>
    `<span class="resume-contact-item"><svg aria-hidden="true" viewBox="0 0 24 24">${contactIcons[icon]}</svg><span>${htmlEscape(value)}</span></span>`
  const contact = [
    { icon: 'email', value: data.personal.email },
    { icon: 'phone', value: data.personal.phone },
    { icon: 'address', value: [data.personal.city, data.personal.country].filter(Boolean).join(', ') },
    { icon: 'linkedin', value: data.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '') },
  ].filter(({ value }) => value).map(({ icon, value }) => contactItem(icon as keyof typeof contactIcons, value)).join('')
  const photo = photoDataUri
    ? `<img class="resume-photo" src="${htmlEscape(photoDataUri)}" alt=""/>`
    : ''
  const themeCss = `
    .resume--${template.id} .resume-name,.resume--${template.id} .resume-entry h3{color:${template.ink}}
    .resume--${template.id} .resume-kicker,.resume--${template.id} .resume-section h2{color:${template.accent}}
  `
  const layoutCss = {
    editorial: '',
    banner: template.id === 'plantilla-11'
      ? `.resume--${template.id} .resume-header{background:${template.ink};border-bottom:7px solid ${template.accent};margin:0 0 18px;padding:18px}.resume--${template.id} .resume-name,.resume--${template.id} .resume-contact{color:white}`
      : '',
    classic: '',
    rail: `.resume--layout-rail .resume-header{border-left:7px solid ${template.accent};padding-left:18px}`,
    minimal: '.resume--layout-minimal .resume-header{border-bottom:1px solid #d5d9dc;margin-bottom:12px}',
    'top-band': `.resume--layout-top-band .resume-header{background:${template.accent};border-bottom:7px solid #b7d5ce;margin-bottom:18px;padding:18px}.resume--layout-top-band .resume-name,.resume--layout-top-band .resume-kicker,.resume--layout-top-band .resume-contact{color:white}`,
    centered: '.resume--layout-centered .resume-header{flex-direction:column;margin-bottom:15px;text-align:center}.resume--layout-centered .resume-contact{text-align:center}',
    split: `.resume--layout-split .resume-header{border-left:9px solid ${template.accent};padding-left:20px}`,
    compact: '.resume--layout-compact .resume-section{padding:9px 0}.resume--layout-compact .resume-header{margin-bottom:10px}',
    modern: `.resume--layout-modern .resume-header{border-top:7px solid ${template.accent};border-bottom:0;padding-top:18px}`,
    monochrome: '.resume--layout-monochrome .resume-header{border-bottom:2px solid #777}.resume--layout-monochrome .resume-section h2{border-left:2px solid #777;padding-left:7px}',
    columns: '.resume--layout-columns .resume-header{border-bottom:5px solid #0b7278;margin-bottom:10px}.resume--layout-columns .resume-section{grid-template-columns:65px minmax(0,1fr)}',
  }[template.layout]

  return `<html><head><meta charset="utf-8"/><style>
    @page{size:A4;margin:16mm 14mm}
    *{box-sizing:border-box}
    body{margin:0;color:#252724;font-family:Arial,sans-serif;font-size:10pt}
    .resume-header{align-items:center;border-bottom:2px solid #c66243;display:flex;gap:16px;margin-bottom:18px;padding:0 0 18px}
    .resume-photo{border-radius:50%;height:70px;object-fit:cover;width:70px}
    .resume-identity{min-width:0}
    .resume-kicker{color:#c66243;font-size:8pt;font-weight:700;letter-spacing:1px;margin:0 0 5px}
    .resume-name{color:#173c3a;font-size:25pt;line-height:1.1;margin:0 0 6px}
    .resume-contact{align-items:center;color:#646761;display:flex;flex-wrap:wrap;font-size:9pt;gap:5px 12px;margin:0;min-width:0}
    .resume-contact-item{align-items:center;display:inline-flex;gap:4px;max-width:100%;min-width:0}
    .resume-contact-item svg{fill:none;flex:0 0 12px;height:12px;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.8;width:12px}
    .resume-contact-item>span{min-width:0;overflow-wrap:anywhere}
    .resume-section{border-top:1px solid #d8d8d2;break-inside:auto;display:grid;gap:14px;grid-template-columns:75px minmax(0,1fr);padding:13px 0}
    .resume-section h2{color:#bd5b3e;font-size:9pt;letter-spacing:1px;margin:0;break-after:avoid-page;page-break-after:avoid}
    .resume-section-content{min-width:0}
    .resume-entry{break-inside:avoid-page;margin:0 0 10px;page-break-inside:avoid}
    .resume-entry h3{color:#203c3b;font-size:11pt;margin:0 0 2px}
    .resume-entry strong{color:#5e625d;font-size:9pt}
    .resume-entry p{color:#555852;font-size:9pt;line-height:1.5;margin:4px 0;overflow-wrap:anywhere;orphans:3;widows:3}
    .resume-entry time{color:#777a75;display:block;font-size:8pt;margin-top:2px}
    .resume--norte .resume-header{background:#173c3a;border-bottom:7px solid #c66243;margin:0 0 18px;padding:18px}
    .resume--norte .resume-photo{border:3px solid white;border-radius:3px}
    .resume--norte .resume-kicker{color:#e6b6a6}
    .resume--norte .resume-name{color:white;font-size:23pt}
    .resume--norte .resume-contact{color:#e1e9e5}
    .resume--norte .resume-section h2{color:#173c3a}
    .resume--clasica .resume-header{border-bottom:3px solid #51534f;flex-direction:column;margin-bottom:15px;padding-bottom:20px;text-align:center}
    .resume--clasica .resume-photo{border:1px solid #777;border-radius:2px}
    .resume--clasica .resume-kicker{color:#555}
    .resume--clasica .resume-name{color:#2d2e2b;font-family:Georgia,serif;font-size:23pt;text-transform:uppercase}
    .resume--clasica .resume-contact{text-align:center}
    .resume--clasica .resume-section h2{color:#51534f}
    ${themeCss}
    ${layoutCss}
  </style></head><body><main class="resume resume--${data.template} resume--layout-${template.layout}"><header class="resume-header">${photo}<div class="resume-identity"><p class="resume-kicker">CURRÍCULUM PROFESIONAL</p><h1 class="resume-name">${htmlEscape(name)}</h1>${contact ? `<p class="resume-contact">${contact}</p>` : ''}</div></header>${section('Perfil', paragraph(data.personal.profile))}${section('Experiencia', experiences)}${section('Educación', education)}${section('Cursos', courses)}${section('Idiomas', languages)}${customSections}</main></body></html>`
}