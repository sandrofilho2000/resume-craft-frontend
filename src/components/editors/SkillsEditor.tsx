import { Drawer } from '@/components/Drawer';
import { Resume } from '@/types/resume.types';
import { SkillsSubSection } from '@/types/skills.types';
import { ChevronDown, ChevronUp, Copy, Edit2, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface SkillsEditorProps {
  resume: Resume;
  setResume: React.Dispatch<React.SetStateAction<Resume>>;
}

export const SkillsEditor = ({ resume, setResume }: SkillsEditorProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SkillsSubSection | null>(null);
  const [formData, setFormData] = useState<Omit<SkillsSubSection, 'id' | 'skillsSectionId' | 'order'>>({ title: '', skills: [] });

  const subsections = resume.skillSection.subsections;

  const openAddDrawer = () => {
    setEditingItem(null);
    setFormData({ title: '', skills: [] });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: SkillsSubSection) => {
    setEditingItem(item);
    setFormData({ title: item.title, skills: [] });
    setDrawerOpen(true);
  };

  const saveItem = () => {
    setResume(prev => {
      const newItems = editingItem
        ? prev.skillSection.subsections.map(item => 
            item.id === editingItem.id 
              ? { ...item, ...formData }
              : item
          )
        : [...prev.skillSection.subsections, { id: 1, ...formData }];
      
      return {
        ...prev,
        skills: { ...prev.skillSection, groups: newItems },
      };
    });
    
    setDrawerOpen(false);
  };

  const duplicateItem = (item: SkillsSubSection) => {
    setResume(prev => ({
      ...prev,
      skills: {
        ...prev.skillSection,
        groups: [...prev.skillSection.subsections, { ...item, id: 1 }],
      },
    }));
  };

  const deleteItem = (id: number) => {
    setResume(prev => ({
      ...prev,
      skills: {
        ...prev.skillSection,
        groups: prev.skillSection.subsections.filter(item => item.id !== id),
      },
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= subsections.length) return;
    
    setResume(prev => {
      const newItems = [...prev.skillSection.subsections];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return {
        ...prev,
        skills: { ...prev.skillSection, groups: newItems },
      };
    });
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          Skills
          <span className="count-badge">{subsections.length}</span>
        </h2>
        <button onClick={openAddDrawer} className="neo-button-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Skill Group
        </button>
      </div>

      <div className="space-y-3">
        {subsections.map((subsection, index) => (
          <div key={subsection.id} className="item-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-primary">{subsection.title || 'Untitled'}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{}</p>
              </div>
              
              <div className="flex items-center gap-1">
                <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="action-btn disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveItem(index, 'down')} disabled={index === subsection.skills.length - 1} className="action-btn disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => openEditDrawer(subsection)} className="action-btn">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => duplicateItem(subsection)} className="action-btn">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(subsection.id)} className="action-btn-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {subsections.length === 0 && (
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
              value={"formData.text"}
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
