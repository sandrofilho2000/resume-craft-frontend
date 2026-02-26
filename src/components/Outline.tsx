import { useResumeContext } from '@/contexts/ResumeContext';
import { sectionConfigs } from '@/lib/sectionConfigs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { SectionKey } from '@/types/session.types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface OutlineProps {
  onSectionChange?: (section: SectionKey) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onCloseMobile?: () => void;
}

export const Outline = ({ onSectionChange, collapsed = false, onToggleCollapsed, onCloseMobile }: OutlineProps) => {
  const { resume, activeSection, setActiveSection } = useResumeContext();
  const skeletonItems = Array.from({ length: 8 });

  return (
    <div className="h-full flex flex-col">
      <div
        className={cn(
          'p-2 border-b border-border flex items-center gap-2',
          collapsed ? 'md:justify-center' : 'justify-between',
        )}
      >
        <h2
          className={cn(
            'text-sm font-semibold text-muted-foreground uppercase tracking-wider',
            collapsed && 'md:hidden',
          )}
        >
          Sections
        </h2>

        <button
          type="button"
          onClick={onToggleCollapsed}
          className="action-btn hidden md:inline-flex"
          aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          className="action-btn md:hidden ml-auto"
          aria-label="Fechar menu lateral"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {!resume &&
          skeletonItems.map((_, index) => (
            <div
              key={`outline-skeleton-${index}`}
              className={cn(
                'outline-item w-full',
                collapsed && 'md:justify-center md:px-3 md:gap-0',
              )}
              aria-hidden="true"
            >
              <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
              <Skeleton className={cn('h-4 flex-1', collapsed && 'md:hidden')} />
              <Skeleton className={cn('h-5 w-7 rounded-full', collapsed && 'md:hidden')} />
            </div>
          ))}

        {resume &&
          sectionConfigs.map(({ key, label, icon: Icon, getCount }) => {
            const rawCount = getCount?.(resume);
            const count = typeof rawCount === 'number' ? rawCount : null;
            const isActive = activeSection === key;

            return (
              <button
                key={key}
                onClick={() => {
                  setActiveSection(key);
                  onSectionChange?.(key);
                }}
                className={cn(
                  'outline-item w-full text-left border',
                  collapsed && 'md:justify-center md:px-1 md:gap-0',
                  isActive ? 'active border-primary' : 'border-transparent',
                )}
                title={collapsed ? label : undefined}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 flex-shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                <span
                  className={cn(
                    'flex-1 text-sm font-medium',
                    collapsed && 'md:hidden',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
                {count !== null && (
                  <span className={cn('count-badge', collapsed && 'md:hidden')}>{count}</span>
                )}
              </button>
            );
          })}
      </nav>
    </div>
  );
};
