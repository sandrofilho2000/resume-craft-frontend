import { editContact, editEducation, editExperience, editLanguages, editProfile, editProjects, editResume, editSkills } from '@/api/resume.api';
import { saveResume } from '@/lib/storage';
import { ContactSection } from '@/types/contact.types';
import { EducationSection } from '@/types/education.types';
import { ExperienceSection } from '@/types/experience.types';
import { LanguagesSection } from '@/types/languages.types';
import { ProfileSection } from '@/types/profile.types';
import { ProjectsSection } from '@/types/projects.types';
import { SectionKey } from '@/types/session.types';
import { SkillsSection } from '@/types/skills.types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Resume } from '../types/resume.types';

interface useResumeReturn {
  resume: Resume;
  updateResume: (updates: Partial<Resume>) => void;
  updateContact: (updates: Partial<ContactSection>) => void;
  updateProfile: (updates: Partial<ProfileSection>) => void;
  updateSkills: (updates: Partial<SkillsSection>) => void;
  updateExperience: (updates: Partial<ExperienceSection>) => void;
  updateProjects: (updates: Partial<ProjectsSection>) => void;
  updateEducation: (updates: Partial<EducationSection>) => void;
  updateLanguages: (updates: Partial<LanguagesSection>) => void;
  setResume: React.Dispatch<React.SetStateAction<Resume>>;
  resetToDefaults: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  activeSection: SectionKey;
  setActiveSection: (section: SectionKey) => void;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebarOpen: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  previewOpen: boolean;
  setPreviewOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openPreview: () => void;
  closePreview: () => void;
}

export const useResume = (): useResumeReturn => {
  const [resume, setResume] = useState<Resume>();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeSection, setActiveSection] = useState<SectionKey>('header');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContactReqIdRef = useRef(0);
  const lastProfileReqIdRef = useRef(0);
  const lastSkillsReqIdRef = useRef(0);
  const lastExperienceReqIdRef = useRef(0);
  const lastProjectsReqIdRef = useRef(0);
  const lastEducationReqIdRef = useRef(0);
  const lastLanguagesReqIdRef = useRef(0);

  // Auto-save with debounce
  useEffect(() => {
    // Clear existing timeout
    if (!resume) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce save
    timeoutRef.current = setTimeout(() => {
      saveResume(resume);

      // Reset to idle after a short delay
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resume]);


  const updateResume = useCallback((updates: Partial<Resume>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      editResume(updates.id, updates).then((result) => {
        console.log("🚀 ~ useResume ~ result:", result)
      })
    }, 500);
  }, []);

  const updateContact = useCallback(async (updates: Partial<ContactSection>) => {
    // UI otimista
    setResume(prev => {
      if (!prev) return prev as any;
      const nextContact = {
        ...prev.contact,
        ...updates,
        items: updates.items ?? prev.contact?.items ?? [],
      } as any;
      return { ...prev, contact: nextContact };
    });

    const reqId = ++lastContactReqIdRef.current;

    setSaveStatus("saving");
    try {
      const result = await editContact(updates.resumeId, updates);

      // ✅ aplica só se ainda for a requisição mais recente
      if (reqId !== lastContactReqIdRef.current) return;

      setResume(prev => {
        if (!prev) return prev as any;
        return { ...prev, contact: result };
      });

      setSaveStatus("saved");
    } catch (err) {
      if (reqId !== lastContactReqIdRef.current) return;
      console.error(err);
      setSaveStatus("idle");
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<ProfileSection>) => {
    // UI otimista (campo certo)
    setResume(prev => {
      if (!prev) return prev as any;

      const current = prev.profileSection ?? {
        id: 0,
        title: "Professional Profile",
        content: "",
        resumeId: prev.id,
      };

      const nextProfile: ProfileSection = {
        ...current,
        ...updates,
        resumeId: updates.resumeId ?? current.resumeId,
      };

      return { ...prev, profileSection: nextProfile };
    });

    const reqId = ++lastProfileReqIdRef.current;

    setSaveStatus("saving");
    try {
      const result = await editProfile(updates.resumeId!, updates);
      if (reqId !== lastProfileReqIdRef.current) return;

      setResume(prev => {
        if (!prev) return prev as any;
        return { ...prev, profileSection: result };
      });

      setSaveStatus("saved");
    } catch (err) {
      if (reqId !== lastProfileReqIdRef.current) return;
      console.error(err);
      setSaveStatus("idle");
    }
  }, []);

  const updateSkills = useCallback(async (updates: Partial<SkillsSection>) => {
    // UI otimista
    setResume(prev => {
      if (!prev) return prev as any;

      const current = prev.skillSection ?? {
        id: 0,
        title: "Skills",
        resumeId: prev.id,
        subsections: [],
      };

      const nextSkills: SkillsSection = {
        ...current,
        ...updates,
        resumeId: updates.resumeId ?? current.resumeId,
        subsections: updates.subsections ?? current.subsections ?? [],
      };

      return { ...prev, skillSection: nextSkills };
    });

    const reqId = ++lastSkillsReqIdRef.current;

    setSaveStatus("saving");
    try {
      const result = await editSkills(updates.resumeId!, updates);
      if (reqId !== lastSkillsReqIdRef.current) return;

      setResume(prev => {
        if (!prev) return prev as any;
        const previousSubsections = Array.isArray(prev.skillSection?.subsections) ? prev.skillSection.subsections : [];
        const previousById = new Map(previousSubsections.map((sub) => [sub.id, sub]));

        const hasResultSubsections = Array.isArray(result?.subsections);
        const mergedSubsections = (hasResultSubsections ? result.subsections : previousSubsections).map((subsection, index) => {
          const previous = previousById.get(subsection.id);
          const nextSkills = Array.isArray(subsection.skills)
            ? subsection.skills
            : Array.isArray(previous?.skills)
              ? previous.skills
              : [];

          return {
            ...previous,
            ...subsection,
            order: typeof subsection.order === 'number' ? subsection.order : index,
            skills: nextSkills,
          };
        });

        return {
          ...prev,
          skillSection: {
            ...prev.skillSection,
            ...result,
            subsections: mergedSubsections,
          },
        };
      });

      setSaveStatus("saved");
    } catch (err) {
      if (reqId !== lastSkillsReqIdRef.current) return;
      console.error(err);
      setSaveStatus("idle");
    }
  }, []);

  const updateExperience = useCallback(async (updates: Partial<ExperienceSection>) => {
    setResume(prev => {
      if (!prev) return prev as any;

      const current = prev.experience ?? {
        id: 0,
        title: 'Professional Background',
        resumeId: prev.id,
        jobs: [],
      };

      const nextExperience: ExperienceSection = {
        ...current,
        ...updates,
        resumeId: updates.resumeId ?? current.resumeId,
        jobs: updates.jobs ?? current.jobs ?? [],
      };

      return { ...prev, experience: nextExperience };
    });

    const reqId = ++lastExperienceReqIdRef.current;

    setSaveStatus('saving');
    try {
      const result = await editExperience(updates.resumeId!, updates);
      if (reqId !== lastExperienceReqIdRef.current) return;

      setResume(prev => {
        if (!prev) return prev as any;

        const previousJobs = Array.isArray(prev.experience?.jobs) ? prev.experience.jobs : [];
        const previousJobsById = new Map(previousJobs.map((job) => [job.id, job]));
        const hasResultJobs = Array.isArray(result?.jobs);

        const mergedJobs = (hasResultJobs ? result.jobs : previousJobs).map((job, index) => {
          const previous = previousJobsById.get(job.id);
          const bullets = Array.isArray(job.bullets)
            ? job.bullets
            : Array.isArray(previous?.bullets)
              ? previous.bullets
              : [];

          return {
            ...previous,
            ...job,
            order: typeof job.order === 'number' ? job.order : index,
            bullets: bullets.map((bullet, bulletIndex) => ({
              ...bullet,
              order: typeof bullet.order === 'number' ? bullet.order : bulletIndex,
            })),
          };
        });

        return {
          ...prev,
          experience: {
            ...prev.experience,
            ...result,
            jobs: mergedJobs,
          },
        };
      });

      setSaveStatus('saved');
    } catch (err) {
      if (reqId !== lastExperienceReqIdRef.current) return;
      console.error(err);
      setSaveStatus('idle');
    }
  }, []);

  const updateProjects = useCallback(async (updates: Partial<ProjectsSection>) => {
    setResume(prev => {
      if (!prev) return prev as any;

      const current = prev.projectsSection ?? {
        id: 0,
        title: 'Projects',
        resumeId: prev.id,
        projects: [],
      };

      const nextProjects: ProjectsSection = {
        ...current,
        ...updates,
        resumeId: updates.resumeId ?? current.resumeId,
        projects: updates.projects ?? current.projects ?? [],
      };

      return { ...prev, projectsSection: nextProjects };
    });

    const reqId = ++lastProjectsReqIdRef.current;

    setSaveStatus('saving');
    try {
      const result = await editProjects(updates.resumeId!, updates);
      if (reqId !== lastProjectsReqIdRef.current) return;

      setResume(prev => {
        if (!prev) return prev as any;

        const previousItems = Array.isArray(prev.projectsSection?.projects) ? prev.projectsSection.projects : [];
        const previousById = new Map(previousItems.map((item) => [item.id, item]));
        const hasResultProjects = Array.isArray(result?.projects);

        const mergedProjects = (hasResultProjects ? result.projects : previousItems).map((item, index) => {
          const previous = previousById.get(item.id);
          return {
            ...previous,
            ...item,
            order: typeof item.order === 'number' ? item.order : index,
          };
        });

        return {
          ...prev,
          projectsSection: {
            ...prev.projectsSection,
            ...result,
            projects: mergedProjects,
          },
        };
      });

      setSaveStatus('saved');
    } catch (err) {
      if (reqId !== lastProjectsReqIdRef.current) return;
      console.error(err);
      setSaveStatus('idle');
    }
  }, []);

  const updateEducation = useCallback(async (updates: Partial<EducationSection>) => {
    setResume(prev => {
      if (!prev) return prev as any;

      const current = prev.educationSection ?? {
        id: 0,
        title: 'Education',
        resumeId: prev.id,
        items: [],
      };

      const nextEducation: EducationSection = {
        ...current,
        ...updates,
        resumeId: updates.resumeId ?? current.resumeId,
        items: updates.items ?? current.items ?? [],
      };

      return { ...prev, educationSection: nextEducation };
    });

    const reqId = ++lastEducationReqIdRef.current;

    setSaveStatus('saving');
    try {
      const result = await editEducation(updates.resumeId!, updates);
      if (reqId !== lastEducationReqIdRef.current) return;

      setResume(prev => {
        if (!prev) return prev as any;

        const previousItems = Array.isArray(prev.educationSection?.items) ? prev.educationSection.items : [];
        const previousById = new Map(previousItems.map((item) => [item.id, item]));
        const hasResultItems = Array.isArray(result?.items);

        const mergedItems = (hasResultItems ? result.items : previousItems).map((item, index) => ({
          ...previousById.get(item.id),
          ...item,
          order: typeof item.order === 'number' ? item.order : index,
        }));

        return {
          ...prev,
          educationSection: {
            ...prev.educationSection,
            ...result,
            items: mergedItems,
          },
        };
      });

      setSaveStatus('saved');
    } catch (err) {
      if (reqId !== lastEducationReqIdRef.current) return;
      console.error(err);
      setSaveStatus('idle');
    }
  }, []);

  const updateLanguages = useCallback(async (updates: Partial<LanguagesSection>) => {
    setResume(prev => {
      if (!prev) return prev as any;

      const current = prev.languagesSection ?? {
        id: 0,
        title: 'Languages',
        resumeId: prev.id,
        items: [],
      };

      const nextLanguages: LanguagesSection = {
        ...current,
        ...updates,
        resumeId: updates.resumeId ?? current.resumeId,
        items: updates.items ?? current.items ?? [],
      };

      return { ...prev, languagesSection: nextLanguages };
    });

    const reqId = ++lastLanguagesReqIdRef.current;

    setSaveStatus('saving');
    try {
      const result = await editLanguages(updates.resumeId!, updates);
      if (reqId !== lastLanguagesReqIdRef.current) return;

      setResume(prev => {
        if (!prev) return prev as any;

        const previousItems = Array.isArray(prev.languagesSection?.items) ? prev.languagesSection.items : [];
        const previousById = new Map(previousItems.map((item) => [item.id, item]));
        const hasResultItems = Array.isArray(result?.items);

        const mergedItems = (hasResultItems ? result.items : previousItems).map((item, index) => ({
          ...previousById.get(item.id),
          ...item,
          order: typeof item.order === 'number' ? item.order : index,
        }));

        return {
          ...prev,
          languagesSection: {
            ...prev.languagesSection,
            ...result,
            items: mergedItems,
          },
        };
      });

      setSaveStatus('saved');
    } catch (err) {
      if (reqId !== lastLanguagesReqIdRef.current) return;
      console.error(err);
      setSaveStatus('idle');
    }
  }, []);


  const resetToDefaults = useCallback(() => {
    setActiveSection('header');
  }, []);

  const toggleSidebarOpen = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const openPreview = useCallback(() => {
    setPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  return {
    resume,
    updateResume,
    updateContact,
    updateProfile,
    updateSkills,
    updateExperience,
    updateProjects,
    updateEducation,
    updateLanguages,
    setResume,
    resetToDefaults,
    saveStatus,
    activeSection,
    setActiveSection,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    previewOpen,
    setPreviewOpen,
    openPreview,
    closePreview,
  };
};
