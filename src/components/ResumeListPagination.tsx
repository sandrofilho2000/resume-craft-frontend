import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

type ResumeListPaginationProps = {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
};

const buildPageItems = (page: number, totalPages: number): Array<number | '...'> => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const windowStart = Math.max(2, page - 1);
  const windowEnd = Math.min(totalPages - 1, page + 1);
  const pages = [1];

  if (windowStart > 2) pages.push('...' as const);
  for (let p = windowStart; p <= windowEnd; p++) pages.push(p);
  if (windowEnd < totalPages - 1) pages.push('...' as const);

  pages.push(totalPages);
  return pages;
};

export const ResumeListPagination = ({
  page,
  totalPages,
  disabled = false,
  onPageChange,
}: ResumeListPaginationProps) => {
  if (totalPages <= 1) return null;

  const items = buildPageItems(page, totalPages);

  return (
    <div className="flex items-center gap-2 flex-wrap sm:justify-end">
      <button
        type="button"
        className="neo-button text-xs px-2 h-9"
        onClick={() => onPageChange(1)}
        disabled={disabled || page <= 1}
        title="First page"
        aria-label="Go to first page"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        className="neo-button text-xs px-2 h-9"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        title="Previous page"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {items.map((item, index) =>
        item === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground text-sm">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            disabled={disabled}
            className={
              page === item
                ? 'neo-button-primary text-xs min-w-9 h-9 px-3'
                : 'neo-button text-xs min-w-9 h-9 px-3'
            }
            aria-current={page === item ? 'page' : undefined}
            aria-label={`Go to page ${item}`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className="neo-button text-xs px-2 h-9"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        title="Next page"
        aria-label="Go to next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <button
        type="button"
        className="neo-button text-xs px-2 h-9"
        onClick={() => onPageChange(totalPages)}
        disabled={disabled || page >= totalPages}
        title="Last page"
        aria-label="Go to last page"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ResumeListPagination;
