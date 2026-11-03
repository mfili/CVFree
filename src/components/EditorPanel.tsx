import { useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'
import {
  BookOpen,
  BriefcaseBusiness,
  Camera,
  ChevronDown,
  FileText,
  GraduationCap,
  Languages,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react'
import { emptyItems } from '../data/initialResume'
import type { CollectionKey, ResumeData } from '../types'
import { MonthPicker } from './MonthPicker'

interface EditorPanelProps {
  data: ResumeData
  setData: Dispatch<SetStateAction<ResumeData>>
}

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  full?: boolean
}

function Field({ label, value, onChange, placeholder, type = 'text', full }: FieldProps) {
  return (
    <label className={full ? 'field field--full' : 'field'}>
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function TextArea({ label, value, onChange, placeholder }: Omit<FieldProps, 'type' | 'full'>) {
  return (
    <label className="field field--full">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} />
    </label>
  )
}

interface SectionProps {
  id: string
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FormSection({ id, icon, title, subtitle, children, defaultOpen = false }: SectionProps) {
  return (
    <details id={id} className="form-section" open={defaultOpen}>
      <summary>
        <span className="section-icon">{icon}</span>
        <span><strong>{title}</strong><small>{subtitle}</small></span>
        <ChevronDown className="chevron" size={18} aria-hidden="true" />
      </summary>
      <div className="form-section__body">{children}</div>
    </details>
  )
}

function ItemHeader({ index, label, onRemove, canRemove = true }: { index: number; label: string; onRemove: () => void; canRemove?: boolean }) {
  return (
    <div className="item-header">
      <span>{label} {index + 1}</span>
      {canRemove && (
        <button className="icon-button icon-button--danger" type="button" onClick={onRemove} aria-label={`Eliminar ${label.toLowerCase()} ${index + 1}`} title="Eliminar">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  )
}

const AddButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button className="add-button" type="button" onClick={onClick}><Plus size={17} />{children}</button>
)

export function EditorPanel({ data, setData }: EditorPanelProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState('')

  const updatePersonal = (field: keyof ResumeData['personal'], value: string) => {
    setData((current) => ({ ...current, personal: { ...current.personal, [field]: value } }))
  }

  const updateItem = <K extends CollectionKey>(collection: K, id: string, changes: Partial<ResumeData[K][number]>) => {
    setData((current) => ({
      ...current,
      [collection]: current[collection].map((item) => item.id === id ? { ...item, ...changes } : item),
    }))
  }

  const addItem = (collection: CollectionKey) => {
    setData((current) => ({ ...current, [collection]: [...current[collection], emptyItems[collection]()] }))
  }

  const removeItem = (collection: CollectionKey, id: string) => {
    setData((current) => ({ ...current, [collection]: current[collection].filter((item) => item.id !== id) }))
  }

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setPhotoError('Usa una imagen JPG o PNG de hasta 5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updatePersonal('photo', String(reader.result))
      setPhotoError('')
    }
    reader.readAsDataURL(file)
  }

  return (
    <aside className="editor-panel" aria-label="Editor del currículum">
      <div className="editor-intro">
        <span className="eyebrow">Contenido</span>
        <h2>Construye tu historia</h2>
        <p>Completa solo lo que necesites. Los campos vacíos no aparecerán en tu CV.</p>
      </div>

      <FormSection id="personal" icon={<UserRound size={19} />} title="Datos personales" subtitle="Identidad y contacto" defaultOpen>
        <div className="photo-control">
          <button type="button" className="photo-button" onClick={() => fileInput.current?.click()} aria-label="Seleccionar foto de perfil">
            {data.personal.photo ? <img src={data.personal.photo} alt="Foto de perfil seleccionada" /> : <Camera size={24} />}
            <span>{data.personal.photo ? 'Cambiar foto' : 'Agregar foto'}</span>
          </button>
          {data.personal.photo && <button type="button" className="text-button" onClick={() => updatePersonal('photo', '')}>Quitar</button>}
          <input ref={fileInput} type="file" accept="image/png,image/jpeg" onChange={handlePhoto} hidden />
        </div>
        {photoError && <p className="field-error" role="alert">{photoError}</p>}
        <div className="form-grid">
          <Field label="Nombres" value={data.personal.firstName} onChange={(value) => updatePersonal('firstName', value)} placeholder="Valentina" />
          <Field label="Apellidos" value={data.personal.lastName} onChange={(value) => updatePersonal('lastName', value)} placeholder="Herrera" />
          <Field label="Correo electrónico" type="email" value={data.personal.email} onChange={(value) => updatePersonal('email', value)} placeholder="nombre@correo.com" full />
          <Field label="Teléfono" type="tel" value={data.personal.phone} onChange={(value) => updatePersonal('phone', value)} placeholder="+57 300 123 4567" />
          <Field label="Ciudad" value={data.personal.city} onChange={(value) => updatePersonal('city', value)} placeholder="Bogotá" />
          <Field label="País" value={data.personal.country} onChange={(value) => updatePersonal('country', value)} placeholder="Colombia" />
          <Field label="LinkedIn" type="url" value={data.personal.linkedin} onChange={(value) => updatePersonal('linkedin', value)} placeholder="linkedin.com/in/usuario" full />
        </div>
      </FormSection>

      <FormSection id="profile" icon={<FileText size={19} />} title="Perfil profesional" subtitle="Tu propuesta de valor">
        <TextArea label="Descripción" value={data.personal.profile} onChange={(value) => updatePersonal('profile', value)} placeholder="Resume tu experiencia, enfoque y fortalezas en 3 o 4 líneas." />
      </FormSection>

      <FormSection id="experience" icon={<BriefcaseBusiness size={19} />} title="Experiencia laboral" subtitle={`${data.experiences.length} ${data.experiences.length === 1 ? 'puesto' : 'puestos'}`}>
        {data.experiences.map((item, index) => (
          <div className="repeatable-item" key={item.id}>
            <ItemHeader index={index} label="Experiencia" onRemove={() => removeItem('experiences', item.id)} canRemove={data.experiences.length > 1} />
            <div className="form-grid">
              <Field label="Nombre del puesto" value={item.role} onChange={(value) => updateItem('experiences', item.id, { role: value })} placeholder="Diseñadora de producto" full />
              <Field label="Compañía" value={item.company} onChange={(value) => updateItem('experiences', item.id, { company: value })} placeholder="Nombre de la empresa" full />
              <MonthPicker label="Fecha de inicio" value={item.startDate} onChange={(value) => updateItem('experiences', item.id, { startDate: value })} />
              <MonthPicker label="Fecha de finalización" value={item.endDate} present={item.current} allowPresent onChange={(value) => updateItem('experiences', item.id, { endDate: value })} onPresentChange={(current) => updateItem('experiences', item.id, { current })} />
              <TextArea label="Descripción" value={item.description} onChange={(value) => updateItem('experiences', item.id, { description: value })} placeholder="Describe responsabilidades, logros e impacto." />
            </div>
          </div>
        ))}
        <AddButton onClick={() => addItem('experiences')}>Agregar experiencia</AddButton>
      </FormSection>

      <FormSection id="education" icon={<GraduationCap size={19} />} title="Educación" subtitle={`${data.education.length} ${data.education.length === 1 ? 'registro' : 'registros'}`}>
        {data.education.map((item, index) => (
          <div className="repeatable-item" key={item.id}>
            <ItemHeader index={index} label="Formación" onRemove={() => removeItem('education', item.id)} />
            <div className="form-grid">
              <Field label="Institución" value={item.institution} onChange={(value) => updateItem('education', item.id, { institution: value })} placeholder="Universidad o institución" full />
              <Field label="Grado" value={item.degree} onChange={(value) => updateItem('education', item.id, { degree: value })} placeholder="Título obtenido" full />
              <MonthPicker label="Fecha de inicio" value={item.startDate} onChange={(value) => updateItem('education', item.id, { startDate: value })} />
              <MonthPicker label="Fecha de fin" value={item.endDate} onChange={(value) => updateItem('education', item.id, { endDate: value })} />
            </div>
          </div>
        ))}
        <AddButton onClick={() => addItem('education')}>Agregar educación</AddButton>
      </FormSection>

      <FormSection id="courses" icon={<BookOpen size={19} />} title="Cursos" subtitle="Certificaciones y formación">
        {data.courses.map((item, index) => (
          <div className="repeatable-item" key={item.id}>
            <ItemHeader index={index} label="Curso" onRemove={() => removeItem('courses', item.id)} />
            <div className="form-grid">
              <Field label="Nombre del curso" value={item.name} onChange={(value) => updateItem('courses', item.id, { name: value })} placeholder="Nombre del curso" full />
              <Field label="Expedido por" value={item.issuer} onChange={(value) => updateItem('courses', item.id, { issuer: value })} placeholder="Institución emisora" full />
            </div>
          </div>
        ))}
        <AddButton onClick={() => addItem('courses')}>Agregar curso</AddButton>
      </FormSection>

      <FormSection id="languages" icon={<Languages size={19} />} title="Idiomas" subtitle="Idiomas y nivel">
        {data.languages.map((item, index) => (
          <div className="repeatable-item" key={item.id}>
            <ItemHeader index={index} label="Idioma" onRemove={() => removeItem('languages', item.id)} />
            <div className="form-grid">
              <Field label="Idioma" value={item.name} onChange={(value) => updateItem('languages', item.id, { name: value })} placeholder="Inglés" />
              <label className="field"><span>Nivel</span><select value={item.level} onChange={(event) => updateItem('languages', item.id, { level: event.target.value })}><option value="">Selecciona</option><option>Básico</option><option>Intermedio</option><option>Avanzado</option><option>Nativo</option></select></label>
            </div>
          </div>
        ))}
        <AddButton onClick={() => addItem('languages')}>Agregar idioma</AddButton>
      </FormSection>

      <FormSection id="custom" icon={<Sparkles size={19} />} title="Otras secciones" subtitle="Habilidades e información adicional">
        {data.customSections.map((item, index) => (
          <div className="repeatable-item" key={item.id}>
            <ItemHeader index={index} label="Sección" onRemove={() => removeItem('customSections', item.id)} />
            <div className="form-grid">
              <Field label="Nombre de la sección" value={item.title} onChange={(value) => updateItem('customSections', item.id, { title: value })} placeholder="Habilidades, Voluntariado..." full />
              <TextArea label="Contenido" value={item.description} onChange={(value) => updateItem('customSections', item.id, { description: value })} placeholder="Describe tus habilidades o información relevante." />
            </div>
          </div>
        ))}
        <AddButton onClick={() => addItem('customSections')}>Agregar otra sección</AddButton>
      </FormSection>
    </aside>
  )
}