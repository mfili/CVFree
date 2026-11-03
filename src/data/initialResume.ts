import type { ResumeData } from '../types'

export const createId = () => {
  const cryptoApi = globalThis.crypto
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const randomValue = Math.floor(Math.random() * 16)
    return (character === 'x' ? randomValue : (randomValue & 0x3) | 0x8).toString(16)
  })
}

export const initialResume: ResumeData = {
  template: 'atlas',
  personal: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    linkedin: '',
    photo: '',
    profile: '',
  },
  experiences: [
    { id: createId(), role: '', company: '', startDate: '', endDate: '', current: false, description: '' },
  ],
  education: [
    { id: createId(), institution: '', degree: '', startDate: '', endDate: '' },
  ],
  courses: [{ id: createId(), name: '', issuer: '' }],
  languages: [{ id: createId(), name: '', level: '' }],
  customSections: [{ id: createId(), title: 'Habilidades', description: '' }],
}

export const emptyItems = {
  experiences: () => ({ id: createId(), role: '', company: '', startDate: '', endDate: '', current: false, description: '' }),
  education: () => ({ id: createId(), institution: '', degree: '', startDate: '', endDate: '' }),
  courses: () => ({ id: createId(), name: '', issuer: '' }),
  languages: () => ({ id: createId(), name: '', level: '' }),
  customSections: () => ({ id: createId(), title: '', description: '' }),
}