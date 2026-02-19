import { useToast } from '@/hooks/use-toast';
import { Curriculum } from '@/lib/types';
import { Briefcase, Copy, Download, Globe, GraduationCap, Mail, X } from 'lucide-react';
import { useEffect } from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: Curriculum;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const PreviewModal = ({ isOpen, onClose, curriculum }: PreviewModalProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // const handleCopyJSON = async () => {
  //   const json = exportCurriculumJSON(curriculum);
  //   const success = await copyToClipboard(json);
  //   if (success) {
  //     toast({
  //       title: "Copied!",
  //       description: "JSON copied to clipboard",
  //     });
  //   }
  // };

  // const handleDownloadJSON = () => {
  //   downloadJSON(curriculum, `${curriculum.header_name.replace(/\s+/g, '_')}_resume.json`);
  //   toast({
  //     title: "Downloaded!",
  //     description: "JSON file downloaded",
  //   });
  // };

  const formatDate = (month: number | null, year: number | null, isCurrent: boolean) => {
    if (isCurrent) return 'Present';
    if (!year) return '';
    if (!month) return year.toString();
    return `${MONTH_NAMES[month - 1]} ${year}`;
  };

  if (!isOpen) return null;

  return (
    <div className="preview-modal-overlay fade-in" onClick={onClose}>
      <div 
        className="preview-modal-content p-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border glass-card rounded-t-xl">
          <h2 className="text-lg font-semibold">Resume Preview</h2>
          <div className="flex items-center gap-2">
            <button className="neo-button text-sm flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Export JSON
            </button>
            <button className="neo-button text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button onClick={onClose} className="action-btn ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resume Content */}
        <div className="p-8 space-y-8">
          {/* Header */}
          <header className="text-center pb-6 border-b border-border">
            <h1 className="text-3xl font-bold text-foreground mb-2">{curriculum.header_name}</h1>
            <p className="text-xl text-primary mb-1">{curriculum.header_role}</p>
            {curriculum.job_title && curriculum.company_name && (
              <p className="text-muted-foreground">{curriculum.job_title} at {curriculum.company_name}</p>
            )}
          </header>

          {/* Contact */}
          {curriculum.contact.items.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                <Mail className="w-5 h-5 text-primary" />
                {curriculum.contact.title}
              </h2>
              <div className="flex flex-wrap gap-4">
                {curriculum.contact.items.map(item => (
                  <div key={item.id} className="text-sm">
                    <span className="text-muted-foreground">{item.title}: </span>
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {item.text}
                      </a>
                    ) : (
                      <span className="text-foreground">{item.text}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Profile */}
          {curriculum.profile.paragraphs.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">{curriculum.profile.title}</h2>
              <div className="space-y-2 rich-text-content">
                {curriculum.profile.paragraphs.map(p => (
                  <div key={p.id} dangerouslySetInnerHTML={{ __html: p.text }} />
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {curriculum.skills.groups.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">{curriculum.skills.title}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {curriculum.skills.groups.map(group => (
                  <div key={group.id} className="glass-card-subtle p-3">
                    <h3 className="text-sm font-medium text-primary mb-1">{group.title}</h3>
                    <p className="text-sm text-muted-foreground">{group.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {curriculum.experience.jobs.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                {curriculum.experience.title}
              </h2>
              <div className="space-y-6">
                {curriculum.experience.jobs.map(job => (
                  <div key={job.id} className="relative pl-4 border-l-2 border-primary/30">
                    <div className="mb-2">
                      <h3 className="text-base font-semibold text-foreground">{job.role}</h3>
                      <p className="text-sm text-primary">{job.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(job.start_month, job.start_year, false)} — {formatDate(job.end_month, job.end_year, job.is_current)}
                      </p>
                    </div>
                    {job.bullets.length > 0 && (
                      <ul className="space-y-1">
                        {job.bullets.map(bullet => (
                          <li key={bullet.id} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1.5">•</span>
                            <span>{bullet.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {curriculum.projects.projects.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">{curriculum.projects.title}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {curriculum.projects.projects.map(project => (
                  <div key={project.id} className="glass-card-subtle p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-1">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {curriculum.education.items.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                <GraduationCap className="w-5 h-5 text-primary" />
                {curriculum.education.title}
              </h2>
              <div className="space-y-3">
                {curriculum.education.items.map(item => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{item.institution}</h3>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.start_year} — {item.is_current ? 'Present' : item.end_year}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {curriculum.languages.items.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
                <Globe className="w-5 h-5 text-primary" />
                {curriculum.languages.title}
              </h2>
              <div className="flex flex-wrap gap-3">
                {curriculum.languages.items.map(item => (
                  <div key={item.id} className="glass-card-subtle px-3 py-2">
                    <span className="text-sm font-medium text-foreground">{item.language}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">({item.level})</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
