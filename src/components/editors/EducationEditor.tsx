import { openConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { Drawer } from '@/components/Drawer';
import { useResumeContext } from '@/contexts/ResumeContext';
import { EducationItem } from '@/types/education.types';
import { ChevronDown, ChevronUp, Copy, Edit2, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i);

type EducationForm = Omit<EducationItem, 'id' | 'order' | 'sectionId'>;

const ensureEducationItems = (items?: EducationItem[] | null): EducationItem[] =>
  Array.isArray(items) ? items : [];

const emptyFormData = (): EducationForm => ({
  institution: '',
  text: '',
  startYear: currentYear,
  endYear: null,
  isCurrent: false,
});

export const EducationEditor = () => {
  const { resume, updateEducation, saveStatus } = useResumeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);
  const [formData, setFormData] = useState<EducationForm>(emptyFormData());

  if (!resume) return null;
  const educationSection = resume.educationSection ?? {
    id: 0,
    title: 'Education',
    resumeId: resume.id,
    items: [],
  };

  const sortItems = (items?: EducationItem[] | null) => [...ensureEducationItems(items)].sort((a, b) => a.order - b.order);
  const items = sortItems(educationSection.items);

  const commitEducation = (nextItems: EducationItem[]) => {
    updateEducation({
      ...educationSection,
      resumeId: educationSection.resumeId ?? resume.id,
      items: nextItems.map((item, index) => ({
        ...item,
        order: index,
        sectionId: educationSection.id,
      })),
    });
  };

  const getNextId = (list: EducationItem[]) => (list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1);

  const openAddDrawer = () => {
    setEditingItem(null);
    setFormData(emptyFormData());
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: EducationItem) => {
    setEditingItem(item);
    setFormData({
      institution: item.institution,
      text: item.text,
      startYear: item.startYear,
      endYear: item.endYear,
      isCurrent: item.isCurrent,
    });
    setDrawerOpen(true);
  };

  const saveItem = () => {
    const currentItems = sortItems(educationSection.items);
    const nextId = editingItem?.id ?? getNextId(currentItems);

    const nextItem: EducationItem = {
      id: nextId,
      institution: formData.institution,
      text: formData.text,
      startYear: formData.startYear,
      endYear: formData.isCurrent ? null : formData.endYear,
      isCurrent: formData.isCurrent,
      order: editingItem?.order ?? currentItems.length,
      sectionId: educationSection.id,
    };

    const nextItems = editingItem
      ? currentItems.map((item) => (item.id === editingItem.id ? nextItem : item))
      : [...currentItems, nextItem];

    commitEducation(nextItems);
    setDrawerOpen(false);
  };

  const duplicateItem = (item: EducationItem) => {
    const currentItems = sortItems(educationSection.items);
    const nextId = getNextId(currentItems);

    commitEducation([
      ...currentItems,
      {
        ...item,
        id: nextId,
        order: currentItems.length,
        sectionId: educationSection.id,
      },
    ]);
  };

  const deleteItem = (id: number) => {
    openConfirmActionDialog({
      title: 'Delete education item',
      message: 'Are you sure you want to delete this education entry?',
      confirmLabel: 'Delete',
      onConfirm: () => {
        commitEducation(sortItems(educationSection.items).filter((item) => item.id !== id));
      },
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const nextItems = [...items];
    [nextItems[index], nextItems[newIndex]] = [nextItems[newIndex], nextItems[index]];
    commitEducation(nextItems);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          {educationSection.title || 'Education'}
          <span className="count-badge">{items.length}</span>
        </h2>
        <button onClick={openAddDrawer} disabled={saveStatus === 'saving'} className="neo-button-primary flex items-center gap-2 text-sm disabled:opacity-50">
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="item-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{item.institution || 'Untitled Institution'}</h3>
                <p className="text-sm text-muted-foreground">{item.text || 'No degree/certification'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.startYear} - {item.isCurrent ? 'Present' : item.endYear || 'N/A'}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => moveItem(index, 'up')} disabled={index === 0 || saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1 || saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => openEditDrawer(item)} disabled={saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => duplicateItem(item)} disabled={saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(item.id)} disabled={saveStatus === 'saving'} className="action-btn-danger disabled:opacity-30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No education added yet. Click "Add Education" to create one.
          </div>
        )}
      </div>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingItem ? 'Edit Education' : 'Add Education'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Institution</label>
            <input type="text" value={formData.institution} onChange={(e) => setFormData((prev) => ({ ...prev, institution: e.target.value }))} className="neo-input" placeholder="e.g., MIT, Stanford University" />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Degree / Certification</label>
            <input type="text" value={formData.text} onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))} className="neo-input" placeholder="e.g., Master of Science in Computer Science" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Start Year</label>
              <select value={formData.startYear} onChange={(e) => setFormData((prev) => ({ ...prev, startYear: Number(e.target.value) }))} className="neo-input">
                {YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">End Year</label>
              <select
                value={formData.isCurrent ? '' : (formData.endYear ?? '')}
                onChange={(e) => setFormData((prev) => ({ ...prev, endYear: e.target.value ? Number(e.target.value) : null, isCurrent: false }))}
                disabled={formData.isCurrent}
                className="neo-input disabled:opacity-50"
              >
                <option value="">Select year</option>
                {YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current_edu"
              checked={formData.isCurrent}
              onChange={(e) => setFormData((prev) => ({ ...prev, isCurrent: e.target.checked, endYear: e.target.checked ? null : prev.endYear }))}
              className="w-4 h-4 rounded bg-secondary border-border"
            />
            <label htmlFor="is_current_edu" className="text-sm text-foreground">Currently studying here</label>
          </div>

          <button onClick={saveItem} disabled={saveStatus === 'saving'} className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {editingItem ? 'Save Changes' : 'Add Education'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
