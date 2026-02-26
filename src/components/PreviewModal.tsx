import { useResumeContext } from '@/contexts/ResumeContext';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PREVIEW_HEADING = '#2C3E50';
const PREVIEW_BODY = '#444440';
const LANGUAGE_LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  NATIVE_FLUENT: 'Native / Fluent',
};

export const PreviewModal = ({ isOpen, onClose }: PreviewModalProps) => {
  const { toast } = useToast();
  const { resume } = useResumeContext();
  const documentRef = useRef<HTMLDivElement | null>(null);

  const contactItems = resume?.contact?.items ?? [];
  const skillGroups = resume?.skillSection?.subsections ?? [];
  const experienceJobs = resume?.experience?.jobs ?? [];
  const projects = resume?.projectsSection?.projects ?? [];
  const educationItems = resume?.educationSection?.items ?? [];
  const languageItems = resume?.languagesSection?.items ?? [];

  const userInfo = {
    name: 'Sandro Filho',
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatDate = (month: number | null, year: number | null, isCurrent: boolean) => {
    if (isCurrent) return 'Present';
    if (!year) return '';
    if (!month) return year.toString();
    return `${MONTH_NAMES[month - 1]} ${year}`;
  };

  const handleDownloadPdf = async () => {
    const printable = documentRef.current;
    if (!printable) {
      toast({
        title: 'Download failed',
        description: 'Preview document is not ready yet.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule.default ?? html2pdfModule) as any;

      const fileTitle = `${(resume?.header_name || userInfo.name || 'resume').replace(/\s+/g, '_')}.pdf`;
      const exportNode = printable.cloneNode(true) as HTMLElement;

      // Remove visual chrome from the PDF export while keeping it in the on-screen preview.
      exportNode.style.border = 'none';
      exportNode.style.boxShadow = 'none';
      exportNode.style.borderRadius = '0';
      exportNode.style.maxWidth = '100%';
      exportNode.style.margin = '0';

      const contentNode = exportNode.firstElementChild as HTMLElement | null;
      if (contentNode) {
        contentNode.style.padding = '16px 18px';
      }

      await html2pdf()
        .set({
          margin: [3, 3, 12, 3],
          filename: fileTitle,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
          },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(exportNode)
        .save();
    } catch (error) {
      toast({
        title: 'PDF download failed',
        description: error instanceof Error ? error.message : 'Could not generate the PDF file.',
        variant: 'destructive',
      });
    }
  };

  if (!isOpen || !resume) return null;

  return (
    <div className="preview-modal-overlay fade-in" onClick={onClose}>
      <div className="preview-modal-content p-0" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border glass-card rounded-t-xl">
          <h2 className="text-lg font-semibold">Resume Preview</h2>
          <div className="flex items-center gap-2">
            <button className="neo-button text-sm flex items-center gap-2" type="button">
              <Copy className="w-4 h-4" />
              Export JSON
            </button>
            <button onClick={handleDownloadPdf} className="neo-button text-sm flex items-center gap-2" type="button">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button onClick={onClose} className="action-btn ml-2" type="button">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-2 md:p-3 bg-muted/20">
          <div ref={documentRef} className="mx-auto w-full max-w-[820px] rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="px-4 py-4 md:px-6 md:py-5 text-slate-900 space-y-3">
              <header className="text-center  pb-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1" style={{ color: PREVIEW_HEADING }}>{userInfo.name}</h1>
                {resume.header_role && (
                  <p className="text-base md:text-lg font-semibold tracking-wide uppercase" style={{ color: PREVIEW_HEADING }}>
                    {resume.header_role}
                  </p>
                )}
              </header>

              {resume.contact && contactItems.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: PREVIEW_HEADING }}>
                    {resume.contact.title}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] leading-5" style={{ color: PREVIEW_BODY }}>
                    {contactItems.map((item) => (
                      <div key={item.id}>
                        <span style={{ color: PREVIEW_BODY }}>{item.title}: </span>
                        {item.link ? (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: PREVIEW_HEADING }}>
                            {item.text}
                          </a>
                        ) : (
                          <span>{item.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {resume.profileSection && (
                <section className="space-y-2">
                  <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: PREVIEW_HEADING }}>
                    {resume.profileSection.title}
                  </h2>
                  <div className="rich-text-content text-[13px] leading-5 [&_*]:!text-[#444440] [&_a]:!underline" style={{ color: PREVIEW_BODY }}>
                    <div dangerouslySetInnerHTML={{ __html: resume.profileSection.content }} />
                  </div>
                </section>
              )}

              {resume.skillSection && skillGroups.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: PREVIEW_HEADING }}>
                    {resume.skillSection.title}
                  </h2>
                  <div className="space-y-1">
                    {skillGroups
                      .filter((group) => group.title)
                      .map((group) => (
                        <div key={group.id} className="text-[13px] leading-5" style={{ color: PREVIEW_BODY }}>
                          <span className="font-semibold" style={{ color: PREVIEW_HEADING }}>{group.title}: </span>
                          <span>{(group.skills ?? []).map((skill) => skill.name).join(', ')}</span>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {resume.experience && experienceJobs.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-base font-bold uppercase tracking-wide leading-none" style={{ color: PREVIEW_HEADING }}>
                    {resume.experience.title}
                  </h2>
                  <div className="space-y-3">
                    {experienceJobs.map((job) => (
                      <div key={job.id} className="space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                          <div>
                            <h3 className="text-sm font-semibold" style={{ color: PREVIEW_HEADING }}>{job.role}</h3>
                            <p className="text-[13px]" style={{ color: PREVIEW_BODY }}>{job.company}</p>
                          </div>
                          <p className="text-[11px] whitespace-nowrap" style={{ color: PREVIEW_BODY }}>
                            {formatDate(job.startMonth, job.startYear, false)} - {formatDate(job.endMonth, job.endYear, job.isCurrent)}
                          </p>
                        </div>
                        {(job.bullets?.length ?? 0) > 0 && (
                          <ul className="list-disc pl-4 space-y-0.5 text-[13px] leading-5" style={{ color: PREVIEW_BODY }}>
                            {(job.bullets ?? []).map((bullet) => (
                              <li key={bullet.id}>{bullet.text}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {resume.projectsSection && projects.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: PREVIEW_HEADING }}>
                    {resume.projectsSection.title}
                  </h2>
                  <div className="space-y-2.5">
                    {projects.map((project) => (
                      <div key={project.id}>
                        <h3 className="text-[13px] font-semibold" style={{ color: PREVIEW_HEADING }}>{project.name}</h3>
                        <div
                          className="text-[13px] rich-text-content leading-5 [&_*]:!text-[#444440] [&_a]:!underline"
                          style={{ color: PREVIEW_BODY }}
                          dangerouslySetInnerHTML={{ __html: project.description || '' }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {resume.educationSection && educationItems.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-base font-bold uppercase tracking-wide leading-none" style={{ color: PREVIEW_HEADING }}>
                    {resume.educationSection.title}
                  </h2>
                  <div className="space-y-2">
                    {educationItems.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-0.5">
                        <div>
                          <h3 className="text-[13px] font-semibold" style={{ color: PREVIEW_HEADING }}>{item.institution}</h3>
                          <p className="text-[13px]" style={{ color: PREVIEW_BODY }}>{item.text}</p>
                        </div>
                        <span className="text-[11px] whitespace-nowrap" style={{ color: PREVIEW_BODY }}>
                          {item.startYear} - {item.isCurrent ? 'Present' : item.endYear}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {resume.languagesSection && languageItems.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-base font-bold uppercase tracking-wide leading-none" style={{ color: PREVIEW_HEADING }}>
                    {resume.languagesSection.title}
                  </h2>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[13px]" style={{ color: PREVIEW_BODY }}>
                    {languageItems.map((item) => (
                      <div key={item.id} className="inline-flex items-center gap-1.5 rounded-md py-1">
                        <span className="font-medium text-[12px]" style={{ color: PREVIEW_HEADING }}>{item.language}</span>
                        <span className="text-[12px]" style={{ color: PREVIEW_BODY }}>
                          {LANGUAGE_LEVEL_LABELS[item.level] ?? item.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
