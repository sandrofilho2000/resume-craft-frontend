export interface ContactItem {
  id: number;
  title: string;
  text: string;
  link: string;
}

export interface ContactSection {
  title: string;
  items: ContactItem[];
}

export interface ProfileParagraph {
  id: number;
  text: string;
}

export interface ProfileSection {
  title: string;
  paragraphs: ProfileParagraph[];
}

export interface SkillGroup {
  id: number;
  title: string;
  text: string;
}

export interface SkillsSection {
  title: string;
  groups: SkillGroup[];
}

export interface JobBullet {
  id: number;
  text: string;
}

export interface Job {
  id: number;
  company: string;
  role: string;
  start_month: number;
  start_year: number;
  end_month: number | null;
  end_year: number | null;
  is_current: boolean;
  bullets: JobBullet[];
}

export interface ExperienceSection {
  title: string;
  jobs: Job[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
}

export interface ProjectsSection {
  title: string;
  projects: Project[];
}

export interface EducationItem {
  id: number;
  institution: string;
  text: string;
  start_year: number;
  end_year: number | null;
  is_current: boolean;
}

export interface EducationSection {
  title: string;
  items: EducationItem[];
}

export type LanguageLevel = 'beginner' | 'intermediate' | 'advanced' | 'native';

export interface LanguageItem {
  id: number;
  language: string;
  level: LanguageLevel;
}

export interface LanguagesSection {
  title: string;
  items: LanguageItem[];
}

export interface Curriculum {
  id: number;
  meta_title: string;
  header_name: string;
  header_role: string;
  job_title: string;
  company_name: string;
  contact: ContactSection;
  profile: ProfileSection;
  skills: SkillsSection;
  experience: ExperienceSection;
  projects: ProjectsSection;
  education: EducationSection;
  languages: LanguagesSection;
}

export type SectionKey = 
  | 'header'
  | 'contact'
  | 'profile'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'languages';
