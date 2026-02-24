import { useResume } from '@/hooks/useResume';
import { createContext, ReactNode, useContext } from 'react';

export type ResumeContextValue = ReturnType<typeof useResume>;

const ResumeContext = createContext<ResumeContextValue | null>(null);

interface ResumeProviderProps {
  children: ReactNode;
}

export const ResumeProvider = ({ children }: ResumeProviderProps) => {
  const resumeState = useResume();

  return (
    <ResumeContext.Provider value={resumeState}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResumeContext = (): ResumeContextValue => {
  const context = useContext(ResumeContext);

  if (!context) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }

  return context;
};
