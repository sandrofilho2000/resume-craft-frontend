import { Resume } from '@/types/resume.types';
import { SectionKey } from '@/types/session.types';
import {
  Briefcase,
  FileText,
  FolderKanban,
  GraduationCap,
  Languages,
  Mail,
  User,
  Wrench
} from 'lucide-react';

interface SectionConfig {
  key: SectionKey;
  label: string;
  icon: typeof User;
  getCount?: (resume: Resume) => number | null;
}

export const sectionConfigs: SectionConfig[] = [
  { key: 'header', label: 'Header', icon: User },
  { 
    key: 'contact', 
    label: 'Contact', 
    icon: Mail,
    getCount: (c) => c.contact?.items?.length ?? 0,
  },
  { 
    key: 'profile', 
    label: 'Profile', 
    icon: FileText,
  },
  { 
    key: 'skills', 
    label: 'Skills', 
    icon: Wrench,
    getCount: (c) => c.skillSection?.subsections?.length ?? 0,
  },
  { 
    key: 'experience', 
    label: 'Experience', 
    icon: Briefcase,
    getCount: (c) => c.experience?.jobs?.length ?? 0,
  },
  { 
    key: 'projects', 
    label: 'Projects', 
    icon: FolderKanban,
    getCount: (c) => c.projectsSection?.projects?.length ?? 0,
  },
  { 
    key: 'education', 
    label: 'Education', 
    icon: GraduationCap,
    getCount: (c) => c.educationSection?.items?.length ?? 0,
  },
  { 
    key: 'languages', 
    label: 'Languages', 
    icon: Languages,
    getCount: (c) => c.languagesSection?.items?.length ?? 0,
  },
];
