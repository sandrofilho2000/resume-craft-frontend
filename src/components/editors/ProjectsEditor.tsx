import { Drawer } from '@/components/Drawer';
import { Project, Resume } from '@/lib/types';
import { ChevronDown, ChevronUp, Copy, Edit2, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ProjectsEditorProps {
  resume: Resume;
  setResume: React.Dispatch<React.SetStateAction<Resume>>;
}

export const ProjectsEditor = ({ resume, setResume }: ProjectsEditorProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({ name: '', description: '' });

  const items = resume.projects.projects;

  const openAddDrawer = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '' });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: Project) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description });
    setDrawerOpen(true);
  };

  const saveItem = () => {
    setResume(prev => {
      const newItems = editingItem
        ? prev.projects.projects.map(item => 
            item.id === editingItem.id 
              ? { ...item, ...formData }
              : item
          )
        : [...prev.projects.projects, { id: 1, ...formData }];
      
      return {
        ...prev,
        projects: { ...prev.projects, projects: newItems },
      };
    });
    
    setDrawerOpen(false);
  };

  const duplicateItem = (item: Project) => {
    setResume(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        projects: [...prev.projects.projects, { ...item, id: 1 }],
      },
    }));
  };

  const deleteItem = (id: number) => {
    setResume(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        projects: prev.projects.projects.filter(item => item.id !== id),
      },
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    
    setResume(prev => {
      const newItems = [...prev.projects.projects];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return {
        ...prev,
        projects: { ...prev.projects, projects: newItems },
      };
    });
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          Projects
          <span className="count-badge">{items.length}</span>
        </h2>
        <button onClick={openAddDrawer} className="neo-button-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="item-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{item.name || 'Untitled Project'}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description || 'No description'}</p>
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
            No projects yet. Click "Add Project" to create one.
          </div>
        )}
      </div>

      <Drawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        title={editingItem ? 'Edit Project' : 'Add Project'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="neo-input"
              placeholder="e.g., E-commerce Platform"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="neo-textarea"
              placeholder="Describe the project, technologies used, and your role..."
            />
          </div>
          
          <button 
            onClick={saveItem} 
            className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            <Save className="w-4 h-4" />
            {editingItem ? 'Save Changes' : 'Add Project'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
