import { Drawer } from '@/components/Drawer';
import { useResumeContext } from '@/contexts/ResumeContext';
import { LanguageItem, LanguageLevel } from '@/types/languages.types';
import { ChevronDown, ChevronUp, Copy, Edit2, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

const LANGUAGE_LEVELS: { value: LanguageLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'NATIVE_FLUENT', label: 'Native / Fluent' },
];

type LanguageForm = Omit<LanguageItem, 'id' | 'order'>;

const ensureLanguageItems = (items?: LanguageItem[] | null): LanguageItem[] =>
  Array.isArray(items) ? items : [];

export const LanguagesEditor = () => {
  const { resume, updateLanguages, saveStatus } = useResumeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LanguageItem | null>(null);
  const [formData, setFormData] = useState<LanguageForm>({
    language: '',
    level: 'INTERMEDIATE',
    sectionId: undefined,
  });

  const languagesSection = resume?.languagesSection;
  if (!resume || !languagesSection) return null;

  const sortItems = (items?: LanguageItem[] | null) => [...ensureLanguageItems(items)].sort((a, b) => a.order - b.order);
  const items = sortItems(languagesSection.items);

  const commitLanguages = (nextItems: LanguageItem[]) => {
    updateLanguages({
      ...languagesSection,
      resumeId: languagesSection.resumeId ?? resume.id,
      items: nextItems.map((item, index) => ({
        ...item,
        order: index,
        sectionId: item.sectionId ?? languagesSection.id,
      })),
    });
  };

  const getNextId = (list: LanguageItem[]) => (list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1);

  const openAddDrawer = () => {
    setEditingItem(null);
    setFormData({ language: '', level: 'INTERMEDIATE', sectionId: languagesSection.id });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: LanguageItem) => {
    setEditingItem(item);
    setFormData({ language: item.language, level: item.level, sectionId: item.sectionId });
    setDrawerOpen(true);
  };

  const saveItem = () => {
    const currentItems = sortItems(languagesSection.items);
    const nextId = editingItem?.id ?? getNextId(currentItems);

    const nextItem: LanguageItem = {
      id: nextId,
      language: formData.language,
      level: formData.level,
      order: editingItem?.order ?? currentItems.length,
      sectionId: formData.sectionId ?? languagesSection.id,
    };

    const nextItems = editingItem
      ? currentItems.map((item) => (item.id === editingItem.id ? nextItem : item))
      : [...currentItems, nextItem];

    commitLanguages(nextItems);
    setDrawerOpen(false);
  };

  const duplicateItem = (item: LanguageItem) => {
    const currentItems = sortItems(languagesSection.items);
    const nextId = getNextId(currentItems);
    commitLanguages([...currentItems, { ...item, id: nextId, order: currentItems.length }]);
  };

  const deleteItem = (id: number) => {
    commitLanguages(sortItems(languagesSection.items).filter((item) => item.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const nextItems = [...items];
    [nextItems[index], nextItems[newIndex]] = [nextItems[newIndex], nextItems[index]];
    commitLanguages(nextItems);
  };

  const getLevelColor = (level: LanguageLevel) => {
    switch (level) {
      case 'NATIVE_FLUENT': return 'text-primary';
      case 'ADVANCED': return 'text-green-400';
      case 'INTERMEDIATE': return 'text-yellow-400';
      case 'BEGINNER': return 'text-orange-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          {languagesSection.title || 'Languages'}
          <span className="count-badge">{items.length}</span>
        </h2>
        <button onClick={openAddDrawer} disabled={saveStatus === 'saving'} className="neo-button-primary flex items-center gap-2 text-sm disabled:opacity-50">
          <Plus className="w-4 h-4" />
          Add Language
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="item-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{item.language || 'Untitled Language'}</h3>
                <p className={`text-sm ${getLevelColor(item.level)}`}>
                  {LANGUAGE_LEVELS.find((l) => l.value === item.level)?.label || item.level}
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
            No languages added yet. Click "Add Language" to create one.
          </div>
        )}
      </div>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingItem ? 'Edit Language' : 'Add Language'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Language</label>
            <input type="text" value={formData.language} onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))} className="neo-input" placeholder="e.g., English, Spanish, Mandarin" />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Proficiency Level</label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, level: level.value }))}
                  className={`neo-button text-sm py-3 ${formData.level === level.value ? 'neo-button-pressed ring-1 ring-primary' : ''}`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={saveItem} disabled={saveStatus === 'saving'} className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {editingItem ? 'Save Changes' : 'Add Language'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
