import { editContact, editResume } from '@/api/resume.api';
import { saveResume } from '@/lib/storage';
import { ContactSection } from '@/types/contact.types';
import { SectionKey } from '@/types/session.types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Resume } from '../types/resume.types';

interface useResumeReturn {
  resume: Resume;
  updateResume: (updates: Partial<Resume>) => void;
  updateContact: (updates: Partial<ContactSection>) => void;
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

  const updateContact = useCallback((updates: Partial<ContactSection>) => {
    setSaveStatus("saving")
    editContact(updates.resumeId, updates).then((result) => {
      console.log("resume: ", resume)
      console.log("🚀 ~ useResume ~ result:", result)
      setResume(prev => {
        setSaveStatus("saved") 
        console.log("🚀 ~ useResume ~ prev:", prev)
        return {
          ...prev,
          contact: result,
        };
      });
    })
  }, []);

  const resetToDefaults = useCallback(() => {
    setActiveSection('header');
  }, []);

  return {
    resume,
    updateResume,
    updateContact,
    setResume,
    resetToDefaults,
    saveStatus,
    activeSection,
    setActiveSection,
  };
};
