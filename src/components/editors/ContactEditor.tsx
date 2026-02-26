import { Drawer } from '@/components/Drawer';
import { openConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { useResumeContext } from '@/contexts/ResumeContext';
import { isValidEmail, normalizeLink } from '@/lib/validation';
import { ContactItem } from '@/types/contact.types';
import { ChevronDown, ChevronUp, Copy, Edit2, Link as LinkIcon, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

export const ContactEditor = () => {
  const { resume, updateContact, saveStatus } = useResumeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContactItem | null>(null);
  const [formData, setFormData] = useState<Omit<ContactItem, 'id' | 'order' | 'sectionId'>>({ title: '', text: '', link: '' });
  const items = resume?.contact?.items ?? [];

  if (!resume?.contact) return null;

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

    const items = resume.contact.items;

    const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) + 1 : 1;

    const newItem: ContactItem = {
      id: editingItem ? editingItem.id : Date.now(),
      title: formData.title,
      text: formData.text,
      link: normalizedLink,
      order: editingItem ? editingItem.order : nextOrder,
      sectionId: resume.contact.id,
    };

    const newItems = editingItem
      ? items.map(item => (item.id === editingItem.id ? newItem : item))
      : [...items, newItem];

    const newContact = { ...resume.contact, items: [...newItems] }

    updateContact(newContact)
    setDrawerOpen(false);
  };

  const duplicateItem = (itemToDuplicate: ContactItem) => {
    const items = resume.contact.items;
    const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) + 1 : 1;
    const nextId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;

    const duplicatedItem: ContactItem = {
      ...itemToDuplicate,
      id: nextId,
      order: nextOrder,
    };

    const newItems = [...items, duplicatedItem];

    const newContact = { ...resume.contact, items: [...newItems] }

    updateContact(newContact)
  };

  const deleteItem = (id: number) => {
    openConfirmActionDialog({
      title: 'Confirm deletion',
      message: 'Are you sure you want to delete this contact item?',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        const items = resume.contact.items;
        const filteredItens = items.filter(item => (item.id !== id))
        const newContact = { ...resume.contact, items: [...filteredItens] }
        updateContact(newContact)
      },
    });
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (!resume?.contact?.items) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= resume.contact.items.length) return;

    const newItems = [...resume.contact.items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    const reordered = newItems.map((item, i) => ({ ...item, order: i + 1 }));
    const nextContact = { ...resume.contact, items: reordered };

    updateContact(nextContact);
  };

  const isEmailField = formData.title.toLowerCase().includes('email');
  const emailError = isEmailField && formData.text && !isValidEmail(formData.text);

  return resume ? (
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
        {resume.contact?.items.map((item, index) => (
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
                <button onClick={() => moveItem(index, 'up')} disabled={index === 0 || saveStatus === "saving"} className="action-btn disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1 || saveStatus === "saving"} className="action-btn disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => openEditDrawer(item)} disabled={saveStatus === "saving"} className="action-btn">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => duplicateItem(item)} disabled={saveStatus === "saving"} className="action-btn">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(item.id)} disabled={saveStatus === "saving"} className="action-btn-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {resume.contact?.items.length === 0 && (
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
  ) : (<></>);
};
