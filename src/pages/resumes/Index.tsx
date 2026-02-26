import { getResumeById } from '@/api/resume.api';
import Header from '@/components/Header';
import { Outline } from '@/components/Outline';
import { PreviewModal } from '@/components/PreviewModal';
import { SectionEditor } from '@/components/SectionEditor';
import { useResumeContext } from '@/contexts/ResumeContext';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ResumePage = () => {
  const { id } = useParams()

  const {
    resume,
    setResume,
    activeSection,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    previewOpen,
    closePreview,
    openPreview,
  } = useResumeContext();


  useEffect(() => {
    if (id) {
      getResumeById(Number(id)).then((result) => {
        setResume((prev) => {
          if (!prev) return result as any;

          const newResume =
            activeSection !== "header"
              ? { ...prev, ...result }
              : { ...result, ...prev };

          return result;
        })
      })
    }
  }, [id])

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
            h-[calc(100vh-4rem)] w-[82vw] max-w-[320px] md:max-w-none
            glass-card border-r border-border rounded-none
            transition-all duration-300 ease-in-out
            md:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            ${sidebarCollapsed ? 'md:w-[60px]' : 'md:w-64'}
          `}
        >
          <Outline
            onSectionChange={() => {
              setSidebarOpen(false);
            }}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
            onCloseMobile={() => setSidebarOpen(false)}
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
                <SectionEditor />
              </div>
              <button
                onClick={openPreview}
                className='neo-button-primary flex items-center justify-center gap-2 mt-6 disabled:opacity-50 w-8 h-8 rounded-full fixed bottom-4 p-0 right-4 z-30'
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,256,256">
                  <g
                    fill="#ffffff"
                    fillRule="nonzero"
                    stroke="none"
                    strokeWidth="1"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                    strokeMiterlimit="10"
                    strokeDasharray=""
                    strokeDashoffset="0"
                    fontFamily="none"
                    fontWeight="none"
                    fontSize="none"
                    textAnchor="none"
                    style={{ mixBlendMode: 'normal' }}
                  >
                    <g transform="scale(5.12,5.12)">
                      <path d="M22.462,11.035l2.88,7.097c1.204,2.968 3.558,5.322 6.526,6.526l7.097,2.88c1.312,0.533 1.312,2.391 0,2.923l-7.097,2.88c-2.968,1.204 -5.322,3.558 -6.526,6.526l-2.88,7.097c-0.533,1.312 -2.391,1.312 -2.923,0l-2.88,-7.097c-1.204,-2.968 -3.558,-5.322 -6.526,-6.526l-7.097,-2.88c-1.312,-0.533 -1.312,-2.391 0,-2.923l7.097,-2.88c2.968,-1.204 5.322,-3.558 6.526,-6.526l2.88,-7.097c0.532,-1.312 2.39,-1.312 2.923,0zM39.945,2.701l0.842,2.428c0.664,1.915 2.169,3.42 4.084,4.084l2.428,0.842c0.896,0.311 0.896,1.578 0,1.889l-2.428,0.842c-1.915,0.664 -3.42,2.169 -4.084,4.084l-0.842,2.428c-0.311,0.896 -1.578,0.896 -1.889,0l-0.842,-2.428c-0.664,-1.915 -2.169,-3.42 -4.084,-4.084l-2.428,-0.842c-0.896,-0.311 -0.896,-1.578 0,-1.889l2.428,-0.842c1.915,-0.664 3.42,-2.169 4.084,-4.084l0.842,-2.428c0.31,-0.896 1.578,-0.896 1.889,0z" />
                    </g>
                  </g>
                </svg>
              </button>
            </main>
          ) : (
            <></>
          )
        }
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewOpen}
        onClose={closePreview}
      />
    </div>
  );
};

export default ResumePage;
