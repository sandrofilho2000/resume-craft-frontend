export interface ContactItem {
  id: number;
  title: string;
  text: string;
  link: string | null;
  order: number;

  sectionId: number;
}

export interface ContactSection {
  id: number;
  title: string;

  resumeId: number;
  items: ContactItem[];
}
