// src/types/resume/experience.types.ts
export interface ExperienceBullet {
  id: number;
  text: string;
  order?: number;
  jobId?: number;
}

export interface ExperienceJob {
  id: number;
  company: string;
  role: string;

  startMonth: number;
  startYear: number;

  endMonth: number | null;
  endYear: number | null;

  isCurrent: boolean;
  order?: number;
  experienceSectionId?: number;

  bullets: ExperienceBullet[];
}

export interface ExperienceSection {
  id: number;
  title: string;
  resumeId?: number;
  jobs: ExperienceJob[];
}
