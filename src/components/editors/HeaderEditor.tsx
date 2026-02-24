import { useResumeContext } from "@/contexts/ResumeContext";

export const HeaderEditor = () => {
  const { resume, updateResume } = useResumeContext();
  if (!resume) return null;

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">Header Information</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Resume Title (Meta)
          </label>
          <input
            type="text"
            defaultValue={resume.meta_title}
            onChange={(e) => updateResume({ ...resume, meta_title: e.target.value })}
            className="neo-input"
            placeholder="e.g., Senior Developer Resume"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Professional Role
          </label>
          <input
            type="text"
            defaultValue={resume.header_role}
            onChange={(e) => updateResume({ ...resume, header_role: e.target.value })}
            className="neo-input"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Current Job Title
            </label>
            <input
              type="text"
              defaultValue={resume.job_title}
              onChange={(e) => updateResume({ ...resume, job_title: e.target.value })}
              className="neo-input"
              placeholder="e.g., Full Stack Developer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Company Name
            </label>
            <input
              type="text"
              defaultValue={resume.company_name}
              onChange={(e) => updateResume({ ...resume, company_name: e.target.value })}
              className="neo-input"
              placeholder="e.g., Tech Company Inc."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
