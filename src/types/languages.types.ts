// src/types/resume/languages.types.ts
export type LanguageLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'NATIVE_FLUENT';

export interface LanguageItem {
  id: number;
  language: string;
  level: LanguageLevel;
  order: number;
}

export interface LanguagesSection {
  id: number;
  title: string;
  items: LanguageItem[];
}
