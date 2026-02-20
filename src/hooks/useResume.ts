import { editResume } from '@/api/resume.api';
import { saveResume } from '@/lib/storage';
import { SectionKey } from '@/types/session.types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Resume } from '../types/resume.types';

interface useResumeReturn {
  resume: Resume;
  updateResume: (updates: Partial<Resume>) => void;
  setResume: React.Dispatch<React.SetStateAction<Resume>>;
  resetToDefaults: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  activeSection: SectionKey;
  setActiveSection: (section: SectionKey) => void;
}

export const useResume = (): useResumeReturn => {
  const [resume, setResume] = useState<Resume>();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeSection, setActiveSection] = useState<SectionKey>('header');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with debounce
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSaveStatus('saving');

    // Debounce save
    timeoutRef.current = setTimeout(() => {
      saveResume(resume);
      setSaveStatus('saved');

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

  const resetToDefaults = useCallback(() => {
    setActiveSection('header');
  }, []);

  return {
    resume,
    updateResume,
    setResume,
    resetToDefaults,
    saveStatus,
    activeSection,
    setActiveSection,
  };
};
