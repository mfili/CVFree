import { AtSign, Linkedin, MapPin, Phone } from 'lucide-react'
import { forwardRef } from 'react'
import { getTemplate } from '../data/templates'
import type { ResumeData } from '../types'
import { dateRange } from '../utils/format'

interface ResumePreviewProps { data: ResumeData }

const ResumeSection = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
  <section className={`resume-section ${className}`}>
    <h3>{title}</h3>
    <div className="resume-section__content">{children}</div>
  </section>
)

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(function ResumePreview({ data }, ref) {
  const { personal } = data
  const template = getTemplate(data.template)
  const fullName = `${personal.firstName} ${personal.lastName}`.trim()
  const experiences = data.experiences.filter((item) => item.role || item.company || item.description)
  const education = data.education.filter((item) => item.institution || item.degree)
  const courses = data.courses.filter((item) => item.name || item.issuer)
  const languages = data.languages.filter((item) => item.name || item.level)
  const customSections = data.customSections.filter((item) => item.description)

  return (
    <article ref={ref} className={`resume resume--${data.template} resume--layout-${template.layout}`} aria-label="Vista previa del currículum">
      <header className="resume-header">
        {personal.photo && <img className="resume-photo" src={personal.photo} alt="" />}
        <div className="resume-identity">
          <p className="resume-kicker">Currículum profesional</p>
          <h1>{fullName || 'Tu nombre'}</h1>
          <div className="resume-contact">
            {personal.email && <span><AtSign size={12} />{personal.email}</span>}
            {personal.phone && <span><Phone size={12} />{personal.phone}</span>}
            {(personal.city || personal.country) && <span><MapPin size={12} />{[personal.city, personal.country].filter(Boolean).join(', ')}</span>}
            {personal.linkedin && <span><Linkedin size={12} />{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
          </div>
        </div>
      </header>

      <div className="resume-body">
        {personal.profile && <ResumeSection title="Perfil"><p>{personal.profile}</p></ResumeSection>}

        {experiences.length > 0 && (
          <ResumeSection title="Experiencia">
            {experiences.map((item) => (
              <div className="resume-entry" key={item.id}>
                <div className="resume-entry__heading"><div><h4>{item.role || 'Nombre del puesto'}</h4><strong>{item.company}</strong></div><time>{dateRange(item.startDate, item.endDate, item.current)}</time></div>
                {item.description && <p>{item.description}</p>}
              </div>
            ))}
          </ResumeSection>
        )}

        {education.length > 0 && (
          <ResumeSection title="Educación">
            {education.map((item) => (
              <div className="resume-entry resume-entry--compact" key={item.id}>
                <div className="resume-entry__heading"><div><h4>{item.degree || 'Grado'}</h4><strong>{item.institution}</strong></div><time>{dateRange(item.startDate, item.endDate)}</time></div>
              </div>
            ))}
          </ResumeSection>
        )}

        <div className="resume-columns">
          {courses.length > 0 && <ResumeSection title="Cursos" className="resume-section--minor">{courses.map((item) => <div className="resume-list-item" key={item.id}><strong>{item.name}</strong><span>{item.issuer}</span></div>)}</ResumeSection>}
          {languages.length > 0 && <ResumeSection title="Idiomas" className="resume-section--minor">{languages.map((item) => <div className="resume-list-item resume-list-item--inline" key={item.id}><strong>{item.name}</strong><span>{item.level}</span></div>)}</ResumeSection>}
        </div>

        {customSections.map((item) => <ResumeSection key={item.id} title={item.title || 'Información adicional'}><p>{item.description}</p></ResumeSection>)}
      </div>
    </article>
  )
})