export interface ProjectItem {
  id: number;
  name: string;
  description: string;
  order: number;

  sectionId: number;
}

export interface ProjectsSection {
  id: number;
  title: string;

  resumeId: number;
  projects: ProjectItem[];
}