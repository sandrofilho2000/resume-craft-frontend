// src/types/resume/experience.types.ts
export interface ExperienceBullet {
  id: number;
  text: string;
  order?: number;
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

  bullets: ExperienceBullet[];
}

export interface ExperienceSection {
  id: number;
  title: string;
  jobs: ExperienceJob[];
}
