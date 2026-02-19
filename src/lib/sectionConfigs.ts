import { 
  User, 
  Mail, 
  FileText, 
  Wrench, 
  Briefcase, 
  FolderKanban, 
  GraduationCap, 
  Languages 
} from 'lucide-react';
import { SectionKey, Curriculum } from '@/lib/types';

interface SectionConfig {
  key: SectionKey;
  label: string;
  icon: typeof User;
  getCount?: (curriculum: Curriculum) => number | null;
}

export const sectionConfigs: SectionConfig[] = [
  { key: 'header', label: 'Header', icon: User },
  { 
    key: 'contact', 
    label: 'Contact', 
    icon: Mail,
    getCount: (c) => c.contact.items.length,
  },
  { 
    key: 'profile', 
    label: 'Profile', 
    icon: FileText,
    getCount: (c) => c.profile.paragraphs.length,
  },
  { 
    key: 'skills', 
    label: 'Skills', 
    icon: Wrench,
    getCount: (c) => c.skills.groups.length,
  },
  { 
    key: 'experience', 
    label: 'Experience', 
    icon: Briefcase,
    getCount: (c) => c.experience.jobs.length,
  },
  { 
    key: 'projects', 
    label: 'Projects', 
    icon: FolderKanban,
    getCount: (c) => c.projects.projects.length,
  },
  { 
    key: 'education', 
    label: 'Education', 
    icon: GraduationCap,
    getCount: (c) => c.education.items.length,
  },
  { 
    key: 'languages', 
    label: 'Languages', 
    icon: Languages,
    getCount: (c) => c.languages.items.length,
  },
];
