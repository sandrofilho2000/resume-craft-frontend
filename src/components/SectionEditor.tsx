import { Resume } from '@/types/resume.types';
import { ContactSection } from '@/types/contact.types';
import { SectionKey } from '@/types/session.types';
import { ContactEditor } from './editors/ContactEditor';
import { EducationEditor } from './editors/EducationEditor';
import { ExperienceEditor } from './editors/ExperienceEditor';
import { HeaderEditor } from './editors/HeaderEditor';
import { LanguagesEditor } from './editors/LanguagesEditor';
import { ProfileEditor } from './editors/ProfileEditor';
import { ProjectsEditor } from './editors/ProjectsEditor';
import { SkillsEditor } from './editors/SkillsEditor';

interface SectionEditorProps {
  activeSection: SectionKey;
  resume: Resume;
  updateResume: (updates: Partial<Resume>) => void;
  updateContact: (updates: Partial<ContactSection>) => void;
  setResume: React.Dispatch<React.SetStateAction<Resume>>;
}

export const SectionEditor = ({
  activeSection,
  resume,
  updateResume,
  updateContact,
  setResume,
}: SectionEditorProps) => {
 
  switch (activeSection) {
    case 'header':
      return <HeaderEditor resume={resume} />;
    case 'contact':
      return <ContactEditor resume={resume} setResume={setResume} updateContact={updateContact} />;
    case 'profile':
      return <ProfileEditor resume={resume} setResume={setResume} />;
    case 'skills':
      return <SkillsEditor resume={resume} setResume={setResume} />;
    case 'experience':
      return <ExperienceEditor resume={resume} setResume={setResume} />;
    case 'projects':
      return <ProjectsEditor resume={resume} setResume={setResume} />;
    case 'education':
      return <EducationEditor resume={resume} setResume={setResume} />;
    case 'languages':
      return <LanguagesEditor resume={resume} setResume={setResume} />;
    default:
      return null;
  }
};
