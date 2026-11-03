import { describe, expect, it } from 'vitest'
import { initialResume } from '../data/initialResume'
import { templates } from '../data/templates'
import { buildNativeResumeHtml } from './exportPdfNative'

describe('Native PDF template export', () => {
  it.each([
    ['atlas', '.resume-header{align-items:center;border-bottom:2px solid #c66243'],
    ['norte', '.resume--norte .resume-header{background:#173c3a'],
    ['clasica', '.resume--clasica .resume-name{color:#2d2e2b;font-family:Georgia,serif'],
  ] as const)('applies the %s template styles', (template, styleSelector) => {
    const html = buildNativeResumeHtml({ ...initialResume, template })

    expect(html).toContain(`class="resume resume--${template} `)
    expect(html).toContain(styleSelector)
  })

  it.each(templates)('renders editor data with the selected %s design', (template) => {
    const data = {
      ...initialResume,
      template: template.id,
      personal: { ...initialResume.personal, firstName: 'Ana', profile: 'Perfil de prueba' },
    }
    const html = buildNativeResumeHtml(data)

    expect(html).toContain(`class="resume resume--${template.id} resume--layout-${template.layout}"`)
    expect(html).toContain(`.resume--${template.id} .resume-name,.resume--${template.id} .resume-entry h3{color:${template.ink}`)
    expect(html).toContain('Perfil de prueba')
    expect(html).toContain('Ana')
  })

  it('includes the selected photo and escapes resume text', () => {
    const data = {
      ...initialResume,
      personal: { ...initialResume.personal, firstName: '<Ana>', phone: '+57 300 123 4567' },
    }
    const html = buildNativeResumeHtml(data, 'data:image/jpeg;base64,abc123')

    expect(html).toContain('src="data:image/jpeg;base64,abc123"')
    expect(html).toContain('&lt;Ana&gt;')
    expect(html).toContain('+57 300 123 4567')
    expect(html).not.toContain('<h1 class="resume-name"><Ana>')
  })

  it('renders icons beside each contact detail and allows contact text to wrap', () => {
    const data = {
      ...initialResume,
      personal: {
        ...initialResume.personal,
        email: 'ana@example.com',
        phone: '+57 300 123 4567',
        city: 'Bogota',
        country: 'Colombia',
        linkedin: 'https://www.linkedin.com/in/ana',
      },
    }
    const html = buildNativeResumeHtml(data)

    expect(html.match(/class="resume-contact-item"/g)).toHaveLength(4)
    expect(html).toContain('ana@example.com')
    expect(html).toContain('+57 300 123 4567')
    expect(html).toContain('Bogota, Colombia')
    expect(html).toContain('linkedin.com/in/ana')
    expect(html).toContain('.resume-contact{align-items:center;color:#646761;display:flex;flex-wrap:wrap;')
    expect(html).toContain('.resume-contact-item>span{min-width:0;overflow-wrap:anywhere}')
  })
})