import { Drawer } from '@/components/Drawer';
import { Curriculum, SkillGroup } from '@/lib/types';
import { ChevronDown, ChevronUp, Copy, Edit2, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface SkillsEditorProps {
  curriculum: Curriculum;
  setCurriculum: React.Dispatch<React.SetStateAction<Curriculum>>;
}

export const SkillsEditor = ({ curriculum, setCurriculum }: SkillsEditorProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SkillGroup | null>(null);
  const [formData, setFormData] = useState<Omit<SkillGroup, 'id'>>({ title: '', text: '' });

  const items = curriculum.skills.groups;

  const openAddDrawer = () => {
    setEditingItem(null);
    setFormData({ title: '', text: '' });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: SkillGroup) => {
    setEditingItem(item);
    setFormData({ title: item.title, text: item.text });
    setDrawerOpen(true);
  };

  const saveItem = () => {
    setCurriculum(prev => {
      const newItems = editingItem
        ? prev.skills.groups.map(item => 
            item.id === editingItem.id 
              ? { ...item, ...formData }
              : item
          )
        : [...prev.skills.groups, { id: 1, ...formData }];
      
      return {
        ...prev,
        skills: { ...prev.skills, groups: newItems },
      };
    });
    
    setDrawerOpen(false);
  };

  const duplicateItem = (item: SkillGroup) => {
    setCurriculum(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        groups: [...prev.skills.groups, { ...item, id: 1 }],
      },
    }));
  };

  const deleteItem = (id: number) => {
    setCurriculum(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        groups: prev.skills.groups.filter(item => item.id !== id),
      },
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    
    setCurriculum(prev => {
      const newItems = [...prev.skills.groups];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return {
        ...prev,
        skills: { ...prev.skills, groups: newItems },
      };
    });
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          Skills
          <span className="count-badge">{items.length}</span>
        </h2>
        <button onClick={openAddDrawer} className="neo-button-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Skill Group
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="item-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-primary">{item.title || 'Untitled'}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.text || 'No skills listed'}</p>
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
            No skill groups yet. Click "Add Skill Group" to create one.
          </div>
        )}
      </div>

      <Drawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        title={editingItem ? 'Edit Skill Group' : 'Add Skill Group'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Category Name</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="neo-input"
              placeholder="e.g., Frontend, Backend, DevOps"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Skills (comma-separated)</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              className="neo-textarea"
              placeholder="e.g., React, TypeScript, Next.js, Tailwind CSS"
            />
          </div>
          
          <button 
            onClick={saveItem} 
            className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            <Save className="w-4 h-4" />
            {editingItem ? 'Save Changes' : 'Add Skill Group'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
