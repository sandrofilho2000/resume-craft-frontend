import { Curriculum, SectionKey } from '@/lib/types';
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
  curriculum: Curriculum;
  setCurriculum: React.Dispatch<React.SetStateAction<Curriculum>>;
}

export const SectionEditor = ({ 
  activeSection, 
  curriculum, 
  setCurriculum,
}: SectionEditorProps) => {
  switch (activeSection) {
    case 'header':
      return <HeaderEditor curriculum={curriculum}/>;
    case 'contact':
      return <ContactEditor curriculum={curriculum} setCurriculum={setCurriculum} />;
    case 'profile':
      return <ProfileEditor curriculum={curriculum} setCurriculum={setCurriculum} />;
    case 'skills':
      return <SkillsEditor curriculum={curriculum} setCurriculum={setCurriculum} />;
    case 'experience':
      return <ExperienceEditor curriculum={curriculum} setCurriculum={setCurriculum} />;
    case 'projects':
      return <ProjectsEditor curriculum={curriculum} setCurriculum={setCurriculum} />;
    case 'education':
      return <EducationEditor curriculum={curriculum} setCurriculum={setCurriculum} />;
    case 'languages':
      return <LanguagesEditor curriculum={curriculum} setCurriculum={setCurriculum} />;
    default:
      return null;
  }
};
