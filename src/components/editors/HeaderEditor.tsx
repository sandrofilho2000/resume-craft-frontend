import { Curriculum } from '@/lib/types';

interface HeaderEditorProps {
  curriculum: Curriculum;
}

export const HeaderEditor = ({ curriculum }: HeaderEditorProps) => {
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
            value={curriculum.meta_title}
            className="neo-input"
            placeholder="e.g., Senior Developer Resume"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={curriculum.header_name}
            className="neo-input"
            placeholder="e.g., John Doe"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Professional Role
          </label>
          <input
            type="text"
            value={curriculum.header_role}
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
              value={curriculum.job_title}
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
              value={curriculum.company_name}
              className="neo-input"
              placeholder="e.g., Tech Company Inc."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
