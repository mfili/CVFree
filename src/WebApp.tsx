import { useEffect, useRef, useState } from 'react'
import { Check, Download, FileText, LoaderCircle } from 'lucide-react'
import { initialResume } from './data/initialResume'
import { templates } from './data/templates'
import type { ResumeData } from './types'
import { EditorPanel } from './components/EditorPanel'
import { ResumePreview } from './components/ResumePreview'
import { exportDocx, exportPdf } from './utils/exportResume'

const STORAGE_KEY = 'cvfreeli-resume'
export default function WebApp() {
  const [data, setData] = useState<ResumeData>(initialResume)
  const [loaded, setLoaded] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const storedData = JSON.parse(stored) as ResumeData
        setData({
          ...initialResume,
          ...storedData,
          personal: { ...initialResume.personal, ...storedData.personal },
        })
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setSaved(true)
    const timeout = window.setTimeout(() => setSaved(false), 1400)
    return () => window.clearTimeout(timeout)
  }, [data, loaded])

  const handleExport = async (format: 'docx' | 'pdf') => {
    setExporting(true)
    setExportError('')
    try {
      if (format === 'docx') await exportDocx(data)
      else if (previewRef.current) await exportPdf(previewRef.current, data)
    } catch {
      setExportError('No se pudo generar el archivo. Inténtalo de nuevo.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="CVFree, inicio">
          <span className="brand-mark"><FileText size={18} aria-hidden="true" /></span>
          <span>CV<span>Free</span></span>
        </a>
        <div className={`save-status ${saved ? 'save-status--visible' : ''}`} role="status">
          {saved && <><Check size={14} aria-hidden="true" /> Guardado</>}
        </div>
      </header>

      <main id="inicio" className="workspace">
        <EditorPanel data={data} setData={setData} />
        <section className="preview-workspace" aria-label="Vista previa del currículum">
          <div className="template-bar">
            <div className="preview-heading"><span className="eyebrow">Diseño</span><h2>Vista previa</h2></div>
            <div className="export-actions">
              <button className="button button--secondary" type="button" disabled={exporting || !loaded} onClick={() => void handleExport('docx')}>
                {exporting ? <LoaderCircle className="spin" size={16} /> : <Download size={16} />}
                DOCX
              </button>
              <button className="button button--primary" type="button" disabled={exporting || !loaded} onClick={() => void handleExport('pdf')}>
                {exporting ? <LoaderCircle className="spin" size={16} /> : <Download size={16} />}
                PDF
              </button>
            </div>
            <div className="template-options" role="group" aria-label="Plantilla">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className={`template-option ${data.template === template.id ? 'template-option--active' : ''}`}
                  type="button"
                  onClick={() => setData((current) => ({ ...current, template: template.id }))}
                  aria-pressed={data.template === template.id}
                >
                  <span className={`template-swatch template-swatch--${template.id}`} aria-hidden="true"><i /><i /></span>
                  <span><strong>{template.name}</strong><small>{template.description}</small></span>
                  {data.template === template.id && <Check size={15} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>
          {exportError && <p className="export-error" role="alert">{exportError}</p>}
          <div className="preview-stage">
            <div className="paper-wrap"><ResumePreview ref={previewRef} data={data} /></div>
          </div>
        </section>
      </main>
    </div>
  )
}