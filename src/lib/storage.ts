import { Resume } from '../types/resume.types';

const STORAGE_KEY = 'resume_builder_data';

export const loadResume = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle any missing fields from older versions
      return { ...parsed};
    }
  } catch (error) {
    console.error('Error loading resume from localStorage:', error);
  }
};

export const saveResume = (resume: Resume): void => {
  if(resume === undefined) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  } catch (error) {
    console.error('Error saving resume to localStorage:', resume);
  }
};

export const resetResume = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error removing resume from localStorage:', error);
  }
};

export const exportResumeJSON = (resume: Resume): string => {
  return JSON.stringify(resume, null, 2);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

export const downloadJSON = (resume: Resume, filename: string = 'resume.json'): void => {
  const json = exportResumeJSON(resume);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
