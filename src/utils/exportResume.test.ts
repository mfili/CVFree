import { describe, expect, it } from 'vitest'
import { calculatePageStarts, collectPageBlocks } from './exportResume'

describe('PDF page layout', () => {
  it('moves a section to the next page when it crosses a page boundary', () => {
    expect(calculatePageStarts(2200, 1000, [{ top: 850, bottom: 1150 }])).toEqual([0, 850, 1850])
  })

  it('allows sections taller than a page to continue across pages', () => {
    expect(calculatePageStarts(2200, 1000, [{ top: 50, bottom: 1550 }])).toEqual([0, 1000, 2000])
  })

  it('keeps individual entries together when their section spans pages', () => {
    expect(calculatePageStarts(2200, 1000, [
      { top: 0, bottom: 1700 },
      { top: 850, bottom: 1150 },
    ])).toEqual([0, 850, 1850])
  })

  it('reserves a top margin on later pages when deciding where to split entries', () => {
    expect(calculatePageStarts(2700, 1000, [{ top: 1800, bottom: 1950 }], 100)).toEqual([0, 1000, 1800])
  })

  it('moves a section intact even when that leaves room at the bottom of the page', () => {
    expect(calculatePageStarts(2100, 1000, [{ top: 200, bottom: 1200 }])).toEqual([0, 200, 1200])
  })

  it('keeps a long section title with its first entry', () => {
    const preview = document.createElement('article')
    preview.innerHTML = '<div class="resume-body"><section class="resume-section"><h3>Experiencia</h3><div class="resume-section__content"><article class="resume-entry">Primer puesto</article><article class="resume-entry">Segundo puesto</article></div></section></div>'
    const section = preview.querySelector('.resume-section') as HTMLElement
    const [firstEntry, secondEntry] = Array.from(preview.querySelectorAll('.resume-entry')) as HTMLElement[]
    const setRect = (element: HTMLElement, top: number, bottom: number) => {
      element.getBoundingClientRect = () => ({ top, bottom, height: bottom - top }) as DOMRect
    }
    setRect(preview, 0, 300)
    setRect(section, 0, 300)
    setRect(firstEntry, 20, 70)
    setRect(secondEntry, 90, 140)
    const blocks = collectPageBlocks(preview, 1)

    expect(blocks[0]).toEqual({ top: 0, bottom: 70 })
    expect(blocks).toHaveLength(2)
  })

  it.each(['Experiencia', 'Educación', 'Cursos'])('splits %s between complete entries even if the section fits on a page', (title) => {
    const preview = document.createElement('article')
    preview.innerHTML = `<section class="resume-section"><h3>${title}</h3><div class="resume-section__content"><article>Primero</article><article>Segundo</article><article>Tercero</article></div></section>`
    const section = preview.querySelector('.resume-section') as HTMLElement
    const entries = Array.from(preview.querySelectorAll('article article')) as HTMLElement[]
    const setRect = (element: HTMLElement, top: number, bottom: number) => {
      element.getBoundingClientRect = () => ({ top, bottom, height: bottom - top }) as DOMRect
    }
    setRect(preview, 0, 1400)
    setRect(section, 720, 1250)
    setRect(entries[0], 750, 880)
    setRect(entries[1], 900, 1060)
    setRect(entries[2], 1080, 1250)

    const blocks = collectPageBlocks(preview, 1)
    expect(blocks).toEqual([
      { top: 720, bottom: 880 },
      { top: 900, bottom: 1060 },
      { top: 1080, bottom: 1250 },
    ])
    expect(calculatePageStarts(1400, 1000, blocks)).toEqual([0, 900])
  })
})