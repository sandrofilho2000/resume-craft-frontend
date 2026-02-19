import { Drawer } from '@/components/Drawer';
import { ContactItem, Curriculum } from '@/lib/types';
import { isValidEmail, normalizeLink } from '@/lib/validation';
import { ChevronDown, ChevronUp, Copy, Edit2, Link as LinkIcon, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ContactEditorProps {
  curriculum: Curriculum;
  setCurriculum: React.Dispatch<React.SetStateAction<Curriculum>>;
}

export const ContactEditor = ({ curriculum, setCurriculum }: ContactEditorProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContactItem | null>(null);
  const [formData, setFormData] = useState<Omit<ContactItem, 'id'>>({ title: '', text: '', link: '' });

  const items = curriculum.contact.items;

  const openAddDrawer = () => {
    setEditingItem(null);
    setFormData({ title: '', text: '', link: '' });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: ContactItem) => {
    setEditingItem(item);
    setFormData({ title: item.title, text: item.text, link: item.link });
    setDrawerOpen(true);
  };

  const saveItem = () => {
    const normalizedLink = normalizeLink(formData.link);
    
    setCurriculum(prev => {
      const newItems = editingItem
        ? prev.contact.items.map(item => 
            item.id === editingItem.id 
              ? { ...item, ...formData, link: normalizedLink }
              : item
          )
        : [...prev.contact.items, { id: 1, ...formData, link: normalizedLink }];
      
      return {
        ...prev,
        contact: { ...prev.contact, items: newItems },
      };
    });
    
    setDrawerOpen(false);
  };

  const duplicateItem = (item: ContactItem) => {
    setCurriculum(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        items: [...prev.contact.items, { ...item, id: 1 }],
      },
    }));
  };

  const deleteItem = (id: number) => {
    setCurriculum(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        items: prev.contact.items.filter(item => item.id !== id),
      },
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    
    setCurriculum(prev => {
      const newItems = [...prev.contact.items];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return {
        ...prev,
        contact: { ...prev.contact, items: newItems },
      };
    });
  };

  const isEmailField = formData.title.toLowerCase().includes('email');
  const emailError = isEmailField && formData.text && !isValidEmail(formData.text);

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          Contact Information
          <span className="count-badge">{items.length}</span>
        </h2>
        <button onClick={openAddDrawer} className="neo-button-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="item-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{item.title || 'Untitled'}</h3>
                <p className="text-sm text-muted-foreground truncate">{item.text || 'No value'}</p>
                {item.link && (
                  <p className="text-xs text-primary truncate flex items-center gap-1 mt-1">
                    <LinkIcon className="w-3 h-3" />
                    {item.link}
                  </p>
                )}
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
            No contact items yet. Click "Add Contact" to create one.
          </div>
        )}
      </div>

      <Drawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        title={editingItem ? 'Edit Contact' : 'Add Contact'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Label</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="neo-input"
              placeholder="e.g., Email, LinkedIn, Phone"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Value</label>
            <input
              type="text"
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              className="neo-input"
              placeholder="e.g., john@email.com"
            />
            {emailError && (
              <p className="text-xs text-destructive mt-1">Please enter a valid email address</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Link (optional)</label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              className="neo-input"
              placeholder="e.g., https://linkedin.com/in/johndoe"
            />
            <p className="text-xs text-muted-foreground mt-1">https:// will be added automatically if missing</p>
          </div>
          
          <button 
            onClick={saveItem} 
            disabled={emailError}
            className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {editingItem ? 'Save Changes' : 'Add Contact'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
