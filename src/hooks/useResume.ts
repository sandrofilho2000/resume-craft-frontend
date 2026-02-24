import { editContact, editProfile, editResume } from '@/api/resume.api';
import { saveResume } from '@/lib/storage';
import { ContactSection } from '@/types/contact.types';
import { ProfileSection } from '@/types/profile.types';
import { SectionKey } from '@/types/session.types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Resume } from '../types/resume.types';

interface useResumeReturn {
  resume: Resume;
  updateResume: (updates: Partial<Resume>) => void;
  updateContact: (updates: Partial<ContactSection>) => void;
  updateProfile: (updates: Partial<ProfileSection>) => void;
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
  const lastContactReqIdRef = useRef(0);
  const lastProfileReqIdRef = useRef(0);

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

      const current = prev.profile ?? {
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

      return { ...prev, profile: nextProfile };
    });

    const reqId = ++lastProfileReqIdRef.current;

    setSaveStatus("saving");
    try {
      const result = await editProfile(updates.resumeId!, updates);
      if (reqId !== lastProfileReqIdRef.current) return;

      setResume(prev => {
        if (!prev) return prev as any;
        return { ...prev, profile: result };
      });

      setSaveStatus("saved");
    } catch (err) {
      if (reqId !== lastProfileReqIdRef.current) return;
      console.error(err);
      setSaveStatus("idle");
    }
  }, []);


  const resetToDefaults = useCallback(() => {
    setActiveSection('header');
  }, []);

  return {
    resume,
    updateResume,
    updateContact,
    updateProfile,
    setResume,
    resetToDefaults,
    saveStatus,
    activeSection,
    setActiveSection,
  };
};
