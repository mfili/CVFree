export type TemplateId =
  | 'atlas'
  | 'norte'
  | 'clasica'
  | 'plantilla-1'
  | 'plantilla-2'
  | 'plantilla-3'
  | 'plantilla-4'
  | 'plantilla-5'
  | 'plantilla-6'
  | 'plantilla-7'
  | 'plantilla-8'
  | 'plantilla-9'
  | 'plantilla-11'
  | 'plantilla-12'

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  country: string
  linkedin: string
  photo: string
  profile: string
}

export interface Experience {
  id: string
  role: string
  company: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  startDate: string
  endDate: string
}

export interface Course {
  id: string
  name: string
  issuer: string
}

export interface Language {
  id: string
  name: string
  level: string
}

export interface CustomSection {
  id: string
  title: string
  description: string
}

export interface ResumeData {
  template: TemplateId
  personal: PersonalInfo
  experiences: Experience[]
  education: Education[]
  courses: Course[]
  languages: Language[]
  customSections: CustomSection[]
}

export type CollectionKey = 'experiences' | 'education' | 'courses' | 'languages' | 'customSections'