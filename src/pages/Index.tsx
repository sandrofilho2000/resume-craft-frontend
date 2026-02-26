import { deleteResume, listResumesBasic } from '@/api/resume.api';
import { openConfirmActionDialog } from '@/components/ConfirmActionDialog';
import CreateResumeDialog from '@/components/CreateResumeDialog';
import Header from '@/components/Header';
import ResumeListPagination from '@/components/ResumeListPagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Edit2, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

const ResumeListSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={`resume-list-skeleton-${index}`} className="item-card relative pl-4 border-l-2 border-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div className="mb-2 space-y-2 flex-1">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const formatCreatedAt = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isSearchTyping, setIsSearchTyping] = useState(false);

  useEffect(() => {
    setIsSearchTyping(searchInput.trim() !== debouncedSearch);

    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 1000);

    return () => clearTimeout(timeout);
  }, [searchInput, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['resumes-basic-list', { q: debouncedSearch, page, pageSize: PAGE_SIZE }],
    queryFn: () => listResumesBasic({ q: debouncedSearch, page, pageSize: PAGE_SIZE }),
    placeholderData: (previous) => previous,
  });

  const resumes = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const showListSkeleton = isLoading || isSearchTyping || isFetching;

  useEffect(() => {
    if (!isFetching && searchInput.trim() === debouncedSearch) {
      setIsSearchTyping(false);
    }
  }, [isFetching, searchInput, debouncedSearch]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['resumes-basic-list'] });
      toast({
        title: 'Resume deleted',
        description: 'The resume was removed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Could not delete the resume.',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteResume = (id: number, title: string) => {
    openConfirmActionDialog({
      title: 'Delete resume',
      message: `Are you sure you want to delete "${title || 'this resume'}"?`,
      confirmLabel: 'Delete',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <section>
              <div className="mb-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Resumes
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
                <div className="relative w-full sm:w-[380px] md:w-[440px]">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="neo-input pl-9 pr-3"
                    placeholder="Search resumes by name, role, or company..."
                  />
                </div>

                <CreateResumeDialog />
              </div>

              <div className="space-y-4">
                {showListSkeleton && <ResumeListSkeleton />}

                {!showListSkeleton && !isError && resumes.length > 0 &&
                  resumes.map((resume) => {
                    const resumeTitle = resume.name || resume.header_name || 'Untitled resume';
                    const createdAtLabel = formatCreatedAt(resume.created_at);

                    return (
                      <div
                        key={resume.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/resumes/${resume.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/resumes/${resume.id}`);
                          }
                        }}
                        className="item-card relative pl-4 border-l-2 border-primary/30 cursor-pointer"
                        title="Open and edit resume"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="mb-2 min-w-0">
                            <h3 className="text-base font-semibold text-foreground">{resumeTitle}</h3>
                            <p className="text-sm text-primary">
                              {resume.job_title || 'No target role'}
                              {resume.company_name ? ` • ${resume.company_name}` : ''}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Click anywhere on this card to edit this resume.
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Created: {createdAtLabel}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              className="neo-button flex items-center gap-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/resumes/${resume.id}`);
                              }}
                              title="Edit resume"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn-danger p-2 disabled:opacity-50"
                              disabled={deleteMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResume(resume.id, resumeTitle);
                              }}
                              title="Delete resume"
                              aria-label={`Delete ${resumeTitle}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {!showListSkeleton && !isError && resumes.length === 0 && (
                  <div className="item-card">
                    <p className="text-sm text-muted-foreground">
                      {debouncedSearch
                        ? 'No resumes matched your search. Try another term or create a new resume.'
                        : 'No resumes yet. Create your first one to get started.'}
                    </p>
                  </div>
                )}

                {!isLoading && isError && (
                  <div className="item-card border border-destructive/30">
                    <p className="text-sm text-muted-foreground">
                      Could not load resumes right now. You can still create a new one.
                    </p>
                  </div>
                )}

                {!showListSkeleton && !isError && totalPages > 1 && (
                  <div className="glass-card-subtle p-3 rounded-xl border border-border/70">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total} resumes
                      </p>

                      <ResumeListPagination
                        page={page}
                        totalPages={totalPages}
                        disabled={isFetching}
                        onPageChange={setPage}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
