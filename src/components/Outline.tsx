import { sectionConfigs } from '@/lib/sectionConfigs';
import { cn } from '@/lib/utils';
import { Resume } from '@/types/resume.types';
import { SectionKey } from '@/types/session.types';

interface OutlineProps {
  resume: Resume;
  activeSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
}

export const Outline = ({ resume, activeSection, onSectionChange }: OutlineProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Sections
        </h2>
      </div>
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sectionConfigs.map(({ key, label, icon: Icon, getCount }) => {
          const count = getCount ? 1 : null;
          const isActive = activeSection === key;
          
          return (
            <button
              key={key}
              onClick={() => onSectionChange(key)}
              className={cn(
                'outline-item w-full text-left',
                isActive && 'active'
              )}
            >
              <Icon className={cn(
                'w-4 h-4 flex-shrink-0',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'flex-1 text-sm font-medium',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {label}
              </span>
              {count !== null && (
                <span className="count-badge">{count}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
