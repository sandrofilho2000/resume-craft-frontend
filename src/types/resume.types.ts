// src/types/resume/resume.types.ts
import type { ContactSection } from './contact.types';
import type { EducationSection } from './education.types';
import type { ExperienceSection } from './experience.types';
import type { LanguagesSection } from './languages.types';
import type { ProfileSection } from './profile.types';
import type { ProjectsSection } from './projects.types';
import type { SkillsSection } from './skills.types';

export interface Resume {
  id: number;
  name: string;
  header_name: string;
  job_title: string;
  company_name: string;
  meta_title: string;
  header_role: string;

  contact?: ContactSection | null;
  profileSection?: ProfileSection | null;
  skillSection?: SkillsSection | null;
  experience?: ExperienceSection | null;
  projectsSection?: ProjectsSection | null;
  educationSection?: EducationSection | null;
  languagesSection?: LanguagesSection | null;
}
