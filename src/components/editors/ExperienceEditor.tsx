import { openConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { Drawer } from '@/components/Drawer';
import { useResumeContext } from '@/contexts/ResumeContext';
import { ExperienceBullet, ExperienceJob } from '@/types/experience.types';
import { ChevronDown, ChevronUp, Copy, Edit2, Plus, PlusCircle, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

type ExperienceJobForm = {
  company: string;
  role: string;
  startMonth: number;
  startYear: number;
  endMonth: number | null;
  endYear: number | null;
  isCurrent: boolean;
  order?: number;
  bullets: ExperienceBullet[];
};

const emptyFormData = (): ExperienceJobForm => ({
  company: '',
  role: '',
  startMonth: 1,
  startYear: currentYear,
  endMonth: null,
  endYear: null,
  isCurrent: true,
  bullets: [],
});

const ensureBulletsArray = (bullets?: ExperienceBullet[] | null): ExperienceBullet[] =>
  Array.isArray(bullets) ? bullets : [];

const ensureJobsArray = (jobs?: ExperienceJob[] | null): ExperienceJob[] =>
  Array.isArray(jobs) ? jobs : [];

export const ExperienceEditor = () => {
  const { resume, updateExperience, saveStatus } = useResumeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<ExperienceJob | null>(null);
  const [formData, setFormData] = useState<ExperienceJobForm>(emptyFormData());

  if (!resume?.experience) return null;

  const sortBullets = (bullets?: ExperienceBullet[] | null) =>
    [...ensureBulletsArray(bullets)].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const normalizeJobs = (items: ExperienceJob[]) =>
    ensureJobsArray(items).map((job, jobIndex) => ({
      ...job,
      order: jobIndex,
      bullets: sortBullets(job.bullets).map((bullet, bulletIndex) => ({
        ...bullet,
        order: bulletIndex,
        jobId: job.id,
      })),
    }));

  const jobs = normalizeJobs(ensureJobsArray(resume.experience.jobs));

  const commitExperience = (nextJobs: ExperienceJob[]) => {
    updateExperience({
      ...resume.experience,
      resumeId: resume.experience.resumeId ?? resume.id,
      jobs: normalizeJobs(nextJobs),
    });
  };

  const getNextJobId = (items: ExperienceJob[]) =>
    items.length > 0 ? Math.max(...items.map((job) => job.id)) + 1 : 1;

  const getNextBulletId = (items: ExperienceJob[]) => {
    const bullets = items.flatMap((job) => ensureBulletsArray(job.bullets));
    return bullets.length > 0 ? Math.max(...bullets.map((bullet) => bullet.id)) + 1 : 1;
  };

  const openAddDrawer = () => {
    setEditingJob(null);
    setFormData(emptyFormData());
    setDrawerOpen(true);
  };

  const openEditDrawer = (job: ExperienceJob) => {
    setEditingJob(job);
    setFormData({
      company: job.company,
      role: job.role,
      startMonth: job.startMonth,
      startYear: job.startYear,
      endMonth: job.endMonth,
      endYear: job.endYear,
      isCurrent: job.isCurrent,
      order: job.order,
      bullets: sortBullets(job.bullets).map((bullet) => ({ ...bullet })),
    });
    setDrawerOpen(true);
  };

  const normalizeBulletsForForm = (jobId: number, bullets: ExperienceBullet[]) =>
    sortBullets(bullets)
      .map((bullet) => ({ ...bullet, text: bullet.text.trim() }))
      .filter((bullet) => bullet.text.length > 0)
      .map((bullet, index) => ({
        ...bullet,
        order: index,
        jobId,
      }));

  const saveJob = () => {
    const currentJobs = ensureJobsArray(resume.experience.jobs);
    const jobId = editingJob?.id ?? getNextJobId(currentJobs);
    const bullets = normalizeBulletsForForm(jobId, formData.bullets);

    const nextJobs = editingJob
      ? currentJobs.map((job) =>
          job.id === editingJob.id
            ? {
                ...job,
                ...formData,
                bullets,
              }
            : job,
        )
      : [
          ...currentJobs,
          {
            id: jobId,
            company: formData.company,
            role: formData.role,
            startMonth: formData.startMonth,
            startYear: formData.startYear,
            endMonth: formData.isCurrent ? null : formData.endMonth,
            endYear: formData.isCurrent ? null : formData.endYear,
            isCurrent: formData.isCurrent,
            order: currentJobs.length,
            experienceSectionId: resume.experience.id,
            bullets,
          },
        ];

    commitExperience(nextJobs);
    setDrawerOpen(false);
  };

  const duplicateJob = (job: ExperienceJob) => {
    const currentJobs = ensureJobsArray(resume.experience.jobs);
    const nextJobId = getNextJobId(currentJobs);
    let nextBulletId = getNextBulletId(currentJobs);

    const duplicatedBullets = sortBullets(job.bullets).map((bullet, index) => ({
      ...bullet,
      id: nextBulletId++,
      order: index,
      jobId: nextJobId,
    }));

    const duplicatedJob: ExperienceJob = {
      ...job,
      id: nextJobId,
      order: currentJobs.length,
      experienceSectionId: resume.experience.id,
      bullets: duplicatedBullets,
    };

    commitExperience([...currentJobs, duplicatedJob]);
  };

  const deleteJob = (id: number) => {
    openConfirmActionDialog({
      title: 'Delete job',
      message: 'Are you sure you want to delete this job experience?',
      confirmLabel: 'Delete',
      onConfirm: () => {
        const nextJobs = ensureJobsArray(resume.experience.jobs).filter((job) => job.id !== id);
        commitExperience(nextJobs);
      },
    });
  };

  const moveJob = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= jobs.length) return;

    const newJobs = [...jobs];
    [newJobs[index], newJobs[newIndex]] = [newJobs[newIndex], newJobs[index]];
    commitExperience(newJobs);
  };

  const addBullet = () => {
    const nextId = formData.bullets.length > 0 ? Math.max(...formData.bullets.map((b) => b.id)) + 1 : 1;
    const currentJobId = editingJob?.id ?? 0;

    setFormData((prev) => ({
      ...prev,
      bullets: [
        ...prev.bullets,
        {
          id: nextId,
          text: '',
          order: prev.bullets.length,
          jobId: currentJobId,
        },
      ],
    }));
  };

  const updateBullet = (id: number, text: string) => {
    setFormData((prev) => ({
      ...prev,
      bullets: prev.bullets.map((bullet) => (bullet.id === id ? { ...bullet, text } : bullet)),
    }));
  };

  const removeBullet = (id: number) => {
    openConfirmActionDialog({
      title: 'Delete bullet point',
      message: 'Remove this bullet point from the job?',
      confirmLabel: 'Delete',
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          bullets: prev.bullets.filter((bullet) => bullet.id !== id).map((bullet, index) => ({ ...bullet, order: index })),
        }));
      },
    });
  };

  const moveBullet = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.bullets.length) return;

    setFormData((prev) => {
      const newBullets = [...prev.bullets];
      [newBullets[index], newBullets[newIndex]] = [newBullets[newIndex], newBullets[index]];
      return {
        ...prev,
        bullets: newBullets.map((bullet, idx) => ({ ...bullet, order: idx })),
      };
    });
  };

  const formatDate = (month: number, year: number) => `${MONTHS.find((m) => m.value === month)?.label.slice(0, 3)} ${year}`;

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          Experience
          <span className="count-badge">{jobs.length}</span>
        </h2>
        <button
          onClick={openAddDrawer}
          disabled={saveStatus === 'saving'}
          className="neo-button-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </button>
      </div>

      <div className="space-y-3">
        {jobs.map((job, index) => (
          <div key={job.id} className="item-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{job.role || 'Untitled Role'}</h3>
                <p className="text-sm text-primary">{job.company || 'No company'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(job.startMonth, job.startYear)} - {job.isCurrent ? 'Present' : job.endMonth && job.endYear ? formatDate(job.endMonth, job.endYear) : 'N/A'}
                </p>
                {ensureBulletsArray(job.bullets).length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{ensureBulletsArray(job.bullets).length} bullet point(s)</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => moveJob(index, 'up')} disabled={index === 0 || saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveJob(index, 'down')} disabled={index === jobs.length - 1 || saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => openEditDrawer(job)} disabled={saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => duplicateJob(job)} disabled={saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => deleteJob(job.id)} disabled={saveStatus === 'saving'} className="action-btn-danger disabled:opacity-30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No experience added yet. Click "Add Job" to create one.
          </div>
        )}
      </div>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingJob ? 'Edit Job' : 'Add Job'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              className="neo-input"
              placeholder="e.g., Tech Company Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              className="neo-input"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Start Month</label>
              <select
                value={formData.startMonth}
                onChange={(e) => setFormData((prev) => ({ ...prev, startMonth: Number(e.target.value) }))}
                className="neo-input"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Start Year</label>
              <select
                value={formData.startYear}
                onChange={(e) => setFormData((prev) => ({ ...prev, startYear: Number(e.target.value) }))}
                className="neo-input"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={formData.isCurrent}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isCurrent: e.target.checked,
                  endMonth: e.target.checked ? null : prev.endMonth ?? 1,
                  endYear: e.target.checked ? null : prev.endYear ?? currentYear,
                }))
              }
              className="w-4 h-4 rounded bg-secondary border-border"
            />
            <label htmlFor="isCurrent" className="text-sm text-foreground">Currently working here</label>
          </div>

          {!formData.isCurrent && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">End Month</label>
                <select
                  value={formData.endMonth ?? 1}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endMonth: Number(e.target.value) }))}
                  className="neo-input"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">End Year</label>
                <select
                  value={formData.endYear ?? currentYear}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endYear: Number(e.target.value) }))}
                  className="neo-input"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-muted-foreground">Bullet Points</label>
              <button onClick={addBullet} className="neo-button text-xs flex items-center gap-1" type="button">
                <PlusCircle className="w-3 h-3" />
                Add Bullet
              </button>
            </div>

            <div className="space-y-2">
              {formData.bullets.map((bullet, index) => (
                <div key={bullet.id} className="flex items-start gap-2">
                  <span className="text-primary mt-3">*</span>
                  <input
                    type="text"
                    value={bullet.text}
                    onChange={(e) => updateBullet(bullet.id, e.target.value)}
                    className="neo-input flex-1 py-2 text-sm"
                    placeholder="Describe an achievement..."
                  />
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveBullet(index, 'up')} disabled={index === 0} className="action-btn disabled:opacity-30 p-1" type="button">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveBullet(index, 'down')} disabled={index === formData.bullets.length - 1} className="action-btn disabled:opacity-30 p-1" type="button">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeBullet(bullet.id)} className="action-btn-danger mt-2" type="button">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {formData.bullets.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">No bullets yet. Click "Add Bullet" to add achievements.</p>
              )}
            </div>
          </div>

          <button
            onClick={saveJob}
            disabled={saveStatus === 'saving'}
            className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {editingJob ? 'Save Changes' : 'Add Job'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
