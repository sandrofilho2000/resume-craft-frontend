import { loadResume, saveResume } from '@/lib/storage';
import { SectionKey } from '@/lib/types';
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
  const [resume, setResume] = useState<Resume>(() => loadResume());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeSection, setActiveSection] = useState<SectionKey>('header');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    setResume(prev => ({ ...prev, ...updates }));
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
