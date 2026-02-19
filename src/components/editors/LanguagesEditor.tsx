import { Drawer } from '@/components/Drawer';
import { Curriculum, LanguageItem, LanguageLevel } from '@/lib/types';
import { ChevronDown, ChevronUp, Copy, Edit2, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface LanguagesEditorProps {
  curriculum: Curriculum;
  setCurriculum: React.Dispatch<React.SetStateAction<Curriculum>>;
}

const LANGUAGE_LEVELS: { value: LanguageLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'native', label: 'Native / Fluent' },
];

export const LanguagesEditor = ({ curriculum, setCurriculum }: LanguagesEditorProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LanguageItem | null>(null);
  const [formData, setFormData] = useState<Omit<LanguageItem, 'id'>>({
    language: '',
    level: 'intermediate',
  });

  const items = curriculum.languages.items;

  const openAddDrawer = () => {
    setEditingItem(null);
    setFormData({ language: '', level: 'intermediate' });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: LanguageItem) => {
    setEditingItem(item);
    setFormData({ language: item.language, level: item.level });
    setDrawerOpen(true);
  };

  const saveItem = () => {
    setCurriculum(prev => {
      const newItems = editingItem
        ? prev.languages.items.map(item => 
            item.id === editingItem.id 
              ? { ...item, ...formData }
              : item
          )
        : [...prev.languages.items, { id: 1, ...formData }];
      
      return {
        ...prev,
        languages: { ...prev.languages, items: newItems },
      };
    });
    
    setDrawerOpen(false);
  };

  const duplicateItem = (item: LanguageItem) => {
    setCurriculum(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        items: [...prev.languages.items, { ...item, id: 1 }],
      },
    }));
  };

  const deleteItem = (id: number) => {
    setCurriculum(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        items: prev.languages.items.filter(item => item.id !== id),
      },
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    
    setCurriculum(prev => {
      const newItems = [...prev.languages.items];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return {
        ...prev,
        languages: { ...prev.languages, items: newItems },
      };
    });
  };

  const getLevelColor = (level: LanguageLevel) => {
    switch (level) {
      case 'native': return 'text-primary';
      case 'advanced': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'beginner': return 'text-orange-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          Languages
          <span className="count-badge">{items.length}</span>
        </h2>
        <button onClick={openAddDrawer} className="neo-button-primary flex items-center gap-2 text-sm">
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
                <p className={`text-sm capitalize ${getLevelColor(item.level)}`}>
                  {LANGUAGE_LEVELS.find(l => l.value === item.level)?.label || item.level}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="action-btn disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} className="action-btn disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => openEditDrawer(item)} className="action-btn">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => duplicateItem(item)} className="action-btn">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(item.id)} className="action-btn-danger">
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

      <Drawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        title={editingItem ? 'Edit Language' : 'Add Language'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Language</label>
            <input
              type="text"
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              className="neo-input"
              placeholder="e.g., English, Spanish, Mandarin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Proficiency Level</label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => setFormData(prev => ({ ...prev, level: level.value }))}
                  className={`neo-button text-sm py-3 ${formData.level === level.value ? 'neo-button-pressed ring-1 ring-primary' : ''}`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={saveItem} 
            className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            <Save className="w-4 h-4" />
            {editingItem ? 'Save Changes' : 'Add Language'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
