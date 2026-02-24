import { useResumeContext } from '@/contexts/ResumeContext';
import { ContactEditor } from './editors/ContactEditor';
import { EducationEditor } from './editors/EducationEditor';
import { ExperienceEditor } from './editors/ExperienceEditor';
import { HeaderEditor } from './editors/HeaderEditor';
import { LanguagesEditor } from './editors/LanguagesEditor';
import { ProfileEditor } from './editors/ProfileEditor';
import { ProjectsEditor } from './editors/ProjectsEditor';
import { SkillsEditor } from './editors/SkillsEditor';

export const SectionEditor = () => {
  const { activeSection } = useResumeContext();
 
  switch (activeSection) {
    case 'header':
      return <HeaderEditor />;
    case 'contact':
      return <ContactEditor />;
    case 'profile':
      return <ProfileEditor />;
    case 'skills':
      return <SkillsEditor />;
    case 'experience':
      return <ExperienceEditor />;
    case 'projects':
      return <ProjectsEditor />;
    case 'education':
      return <EducationEditor />;
    case 'languages':
      return <LanguagesEditor />;
    default:
      return null;
  }
};
