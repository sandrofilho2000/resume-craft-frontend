export interface EducationItem {
  id: number;
  institution: string;
  text: string;

  startYear: number;
  endYear: number | null;
  isCurrent: boolean;

  order: number;

  sectionId: number;
}

export interface EducationSection {
  id: number;
  title: string;

  resumeId: number;
  items: EducationItem[];
}