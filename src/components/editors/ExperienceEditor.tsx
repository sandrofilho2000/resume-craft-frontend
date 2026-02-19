import { Drawer } from '@/components/Drawer';
import { Curriculum, Job } from '@/lib/types';
import { ChevronDown, ChevronUp, Copy, Edit2, Plus, PlusCircle, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface ExperienceEditorProps {
  curriculum: Curriculum;
  setCurriculum: React.Dispatch<React.SetStateAction<Curriculum>>;
}

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

export const ExperienceEditor = ({ curriculum, setCurriculum }: ExperienceEditorProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<Omit<Job, 'id'>>({
    company: '',
    role: '',
    start_month: 1,
    start_year: currentYear,
    end_month: null,
    end_year: null,
    is_current: true,
    bullets: [],
  });

  const jobs = curriculum.experience.jobs;

  const openAddDrawer = () => {
    setEditingJob(null);
    setFormData({
      company: '',
      role: '',
      start_month: 1,
      start_year: currentYear,
      end_month: null,
      end_year: null,
      is_current: true,
      bullets: [],
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (job: Job) => {
    setEditingJob(job);
    setFormData({
      company: job.company,
      role: job.role,
      start_month: job.start_month,
      start_year: job.start_year,
      end_month: job.end_month,
      end_year: job.end_year,
      is_current: job.is_current,
      bullets: [...job.bullets],
    });
    setDrawerOpen(true);
  };

  const saveJob = () => {
    setCurriculum(prev => {
      const newJobs = editingJob
        ? prev.experience.jobs.map(job => 
            job.id === editingJob.id 
              ? { ...job, ...formData }
              : job
          )
        : [...prev.experience.jobs, { id: 1, ...formData }];
      
      return {
        ...prev,
        experience: { ...prev.experience, jobs: newJobs },
      };
    });
    
    setDrawerOpen(false);
  };

  const duplicateJob = (job: Job) => {
    const newBullets = job.bullets.map(b => ({ ...b, id: 1 }));
    setCurriculum(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        jobs: [...prev.experience.jobs, { ...job, id: 1, bullets: newBullets }],
      },
    }));
  };

  const deleteJob = (id: number) => {
    setCurriculum(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        jobs: prev.experience.jobs.filter(job => job.id !== id),
      },
    }));
  };

  const moveJob = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= jobs.length) return;
    
    setCurriculum(prev => {
      const newJobs = [...prev.experience.jobs];
      [newJobs[index], newJobs[newIndex]] = [newJobs[newIndex], newJobs[index]];
      return {
        ...prev,
        experience: { ...prev.experience, jobs: newJobs },
      };
    });
  };

  // Bullet management within the drawer
  const addBullet = () => {
    setFormData(prev => ({
      ...prev,
      bullets: [...prev.bullets, { id: 1, text: '' }],
    }));
  };

  const updateBullet = (id: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      bullets: prev.bullets.map(b => b.id === id ? { ...b, text } : b),
    }));
  };

  const removeBullet = (id: number) => {
    setFormData(prev => ({
      ...prev,
      bullets: prev.bullets.filter(b => b.id !== id),
    }));
  };

  const moveBullet = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.bullets.length) return;
    
    setFormData(prev => {
      const newBullets = [...prev.bullets];
      [newBullets[index], newBullets[newIndex]] = [newBullets[newIndex], newBullets[index]];
      return { ...prev, bullets: newBullets };
    });
  };

  const formatDate = (month: number, year: number) => {
    return `${MONTHS.find(m => m.value === month)?.label.slice(0, 3)} ${year}`;
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          Experience
          <span className="count-badge">{jobs.length}</span>
        </h2>
        <button onClick={openAddDrawer} className="neo-button-primary flex items-center gap-2 text-sm">
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
                  {formatDate(job.start_month, job.start_year)} — {job.is_current ? 'Present' : job.end_month && job.end_year ? formatDate(job.end_month, job.end_year) : 'N/A'}
                </p>
                {job.bullets.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{job.bullets.length} bullet point(s)</p>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <button onClick={() => moveJob(index, 'up')} disabled={index === 0} className="action-btn disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveJob(index, 'down')} disabled={index === jobs.length - 1} className="action-btn disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => openEditDrawer(job)} className="action-btn">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => duplicateJob(job)} className="action-btn">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => deleteJob(job.id)} className="action-btn-danger">
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

      <Drawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        title={editingJob ? 'Edit Job' : 'Add Job'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="neo-input"
              placeholder="e.g., Tech Company Inc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="neo-input"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Start Month</label>
              <select
                value={formData.start_month}
                onChange={(e) => setFormData(prev => ({ ...prev, start_month: Number(e.target.value) }))}
                className="neo-input"
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Start Year</label>
              <select
                value={formData.start_year}
                onChange={(e) => setFormData(prev => ({ ...prev, start_year: Number(e.target.value) }))}
                className="neo-input"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                is_current: e.target.checked,
                end_month: e.target.checked ? null : currentYear >= prev.start_year ? 1 : null,
                end_year: e.target.checked ? null : currentYear,
              }))}
              className="w-4 h-4 rounded bg-secondary border-border"
            />
            <label htmlFor="is_current" className="text-sm text-foreground">Currently working here</label>
          </div>

          {!formData.is_current && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">End Month</label>
                <select
                  value={formData.end_month || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_month: Number(e.target.value) }))}
                  className="neo-input"
                >
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">End Year</label>
                <select
                  value={formData.end_year || currentYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_year: Number(e.target.value) }))}
                  className="neo-input"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Bullets Section */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-muted-foreground">Bullet Points</label>
              <button onClick={addBullet} className="neo-button text-xs flex items-center gap-1">
                <PlusCircle className="w-3 h-3" />
                Add Bullet
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.bullets.map((bullet, index) => (
                <div key={bullet.id} className="flex items-start gap-2">
                  <span className="text-primary mt-3">•</span>
                  <input
                    type="text"
                    value={bullet.text}
                    onChange={(e) => updateBullet(bullet.id, e.target.value)}
                    className="neo-input flex-1 py-2 text-sm"
                    placeholder="Describe an achievement..."
                  />
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveBullet(index, 'up')} disabled={index === 0} className="action-btn disabled:opacity-30 p-1">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveBullet(index, 'down')} disabled={index === formData.bullets.length - 1} className="action-btn disabled:opacity-30 p-1">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeBullet(bullet.id)} className="action-btn-danger mt-2">
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
            className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            <Save className="w-4 h-4" />
            {editingJob ? 'Save Changes' : 'Add Job'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
