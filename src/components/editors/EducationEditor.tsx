import { Drawer } from '@/components/Drawer';
import { useResumeContext } from '@/contexts/ResumeContext';
import { EducationItem } from '@/lib/types';
import { ChevronDown, ChevronUp, Copy, Edit2, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i);

export const EducationEditor = () => {
  const { resume, setResume } = useResumeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);
  const [formData, setFormData] = useState<Omit<EducationItem, 'id'>>({
    institution: '',
    text: '',
    start_year: currentYear,
    end_year: null,
    is_current: false,
  });

  if (!resume?.education) return null;
  const items = resume.education.items;

  const openAddDrawer = () => {
    setEditingItem(null);
    setFormData({
      institution: '',
      text: '',
      start_year: currentYear,
      end_year: null,
      is_current: false,
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: EducationItem) => {
    setEditingItem(item);
    setFormData({
      institution: item.institution,
      text: item.text,
      start_year: item.start_year,
      end_year: item.end_year,
      is_current: item.is_current,
    });
    setDrawerOpen(true);
  };

  const saveItem = () => {
    setResume(prev => {
      const newItems = editingItem
        ? prev.education.items.map(item => 
            item.id === editingItem.id 
              ? { ...item, ...formData }
              : item
          )
        : [...prev.education.items, { id: 1, ...formData }];
      
      return {
        ...prev,
        education: { ...prev.education, items: newItems },
      };
    });
    
    setDrawerOpen(false);
  };

  const duplicateItem = (item: EducationItem) => {
    setResume(prev => ({
      ...prev,
      education: {
        ...prev.education,
        items: [...prev.education.items, { ...item, id: 1 }],
      },
    }));
  };

  const deleteItem = (id: number) => {
    setResume(prev => ({
      ...prev,
      education: {
        ...prev.education,
        items: prev.education.items.filter(item => item.id !== id),
      },
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    
    setResume(prev => {
      const newItems = [...prev.education.items];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return {
        ...prev,
        education: { ...prev.education, items: newItems },
      };
    });
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          Education
          <span className="count-badge">{items.length}</span>
        </h2>
        <button onClick={openAddDrawer} className="neo-button-primary flex items-center gap-2 text-sm">
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
                  {item.start_year} — {item.is_current ? 'Present' : item.end_year || 'N/A'}
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
            No education added yet. Click "Add Education" to create one.
          </div>
        )}
      </div>

      <Drawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        title={editingItem ? 'Edit Education' : 'Add Education'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Institution</label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
              className="neo-input"
              placeholder="e.g., MIT, Stanford University"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Degree / Certification</label>
            <input
              type="text"
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              className="neo-input"
              placeholder="e.g., Master of Science in Computer Science"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">End Year</label>
              <select
                value={formData.is_current ? '' : (formData.end_year || '')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  end_year: e.target.value ? Number(e.target.value) : null,
                  is_current: false,
                }))}
                disabled={formData.is_current}
                className="neo-input disabled:opacity-50"
              >
                <option value="">Select year</option>
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current_edu"
              checked={formData.is_current}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                is_current: e.target.checked,
                end_year: e.target.checked ? null : prev.end_year,
              }))}
              className="w-4 h-4 rounded bg-secondary border-border"
            />
            <label htmlFor="is_current_edu" className="text-sm text-foreground">Currently studying here</label>
          </div>
          
          <button 
            onClick={saveItem} 
            className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            <Save className="w-4 h-4" />
            {editingItem ? 'Save Changes' : 'Add Education'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
