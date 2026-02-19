export interface SkillsItem {
  id: number;
  name: string;
  order: number;

  subSectionId: number;
}

export interface SkillsSubSection {
  id: number;
  title: string;
  order: number;

  skillsSectionId: number;
  skills: SkillsItem[];
}

export interface SkillsSection {
  id: number;
  title: string;

  resumeId: number;
  subsections: SkillsSubSection[];
}