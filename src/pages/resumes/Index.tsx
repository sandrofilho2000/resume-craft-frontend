import { getResumeById } from '@/api/resume.api';
import Header from '@/components/Header';
import { Outline } from '@/components/Outline';
import { PreviewModal } from '@/components/PreviewModal';
import { SectionEditor } from '@/components/SectionEditor';
import { useResume } from '@/hooks/useResume';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ResumePage = () => {
  const { id } = useParams()

  useEffect(() => {
    if (id) {
      getResumeById(1).then((result) => {
        setResume(result)
      })
    }
  }, [id])

  const {
    resume,
    updateResume,
    setResume,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar / Outline */}
        <aside
          className={`
            fixed md:sticky top-16 left-0 z-20 
            w-64 h-[calc(100vh-4rem)] 
            glass-card border-r border-border rounded-none
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <Outline
            resume={resume}
            activeSection={activeSection}
            onSectionChange={(section) => {
              setActiveSection(section);
              setSidebarOpen(false);
            }}
          />
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {
          resume ? (
            <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-8">
              <div className="max-w-3xl mx-auto">
                <SectionEditor
                  activeSection={activeSection}
                  resume={resume}
                  updateResume={updateResume}
                  setResume={setResume}
                />
              </div>
            </main>
          ): (
            <></>
          )
        }
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        resume={resume}
      />
    </div>
  );
};

export default ResumePage;
