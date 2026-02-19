import Header from '@/components/Header';
import { useResume } from '@/hooks/useResume';
import { Briefcase } from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const {
    resetToDefaults,
    saveStatus,
    activeSection,
    setActiveSection,
  } = useResume();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset? This will clear all your data and restore defaults.')) {
      resetToDefaults();
    }
  };

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDate = (month: number | null, year: number | null, isCurrent: boolean) => {
    if (isCurrent) return 'Present';
    if (!year) return '';
    if (!month) return year.toString();
    return `${MONTH_NAMES[month - 1]} ${year}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex">
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Experience */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Resumes
                </h2>
                <div className="space-y-6">
                  <a href="/resumes/1">
                    <div key="1" className="item-card relative pl-4 border-l-2 border-primary/30">
                      <div className="mb-2">
                        <h3 className="text-base font-semibold text-foreground">Tech Company Inc.</h3>
                        <p className="text-sm text-primary">Senior Software Engineer</p>
                      </div>
                    </div>
                  </a>
                </div>
              </section>
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
