import { Drawer } from '@/components/Drawer';
import { ProfileParagraph, Resume } from '@/lib/types';
import { Bold, ChevronDown, ChevronUp, Copy, Edit2, Italic, List, ListOrdered, Plus, Save, Strikethrough } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ProfileEditorProps {
  resume: Resume;
  setResume: React.Dispatch<React.SetStateAction<Resume>>;
}

export const ProfileEditor = ({ resume, setResume }: ProfileEditorProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProfileParagraph | null>(null);
  const [formData, setFormData] = useState<string>('');
  const editorRef = useRef<HTMLDivElement | null>(null);

  const items = resume.profile.paragraphs;

  const stripHtml = (value: string) => {
    if (!value) return '';
    const temp = document.createElement('div');
    temp.innerHTML = value;
    return temp.textContent ?? '';
  };

  const getEditorHtml = () => {
    if (!editorRef.current) return '';
    const text = editorRef.current.textContent?.trim() ?? '';
    if (!text) return '';
    return editorRef.current.innerHTML;
  };

  const applyCommand = (command: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command);
    setFormData(getEditorHtml());
  };

  const openAddDrawer = () => {
    setEditingItem(null);
    setFormData('');
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: ProfileParagraph) => {
    setEditingItem(item);
    setFormData(item.text);
    setDrawerOpen(true);
  };

  useEffect(() => {
    if (!drawerOpen) return;
    if (!editorRef.current) return;
    editorRef.current.innerHTML = formData || '';
  }, [drawerOpen, editingItem]);

  const saveItem = () => {
    setResume(prev => {
      const newItems = editingItem
        ? prev.profile.paragraphs.map(item =>
          item.id === editingItem.id
            ? { ...item, text: formData }
            : item
        )
        : [...prev.profile.paragraphs, { id: 1, text: formData }];

      return {
        ...prev,
        profile: { ...prev.profile, paragraphs: newItems },
      };
    });

    setDrawerOpen(false);
  };

  const duplicateItem = (item: ProfileParagraph) => {
    setResume(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        paragraphs: [...prev.profile.paragraphs, { ...item, id: 1 }],
      },
    }));
  };

  const deleteItem = (id: number) => {
    setResume(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        paragraphs: prev.profile.paragraphs.filter(item => item.id !== id),
      },
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    setResume(prev => {
      const newItems = [...prev.profile.paragraphs];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return {
        ...prev,
        profile: { ...prev.profile, paragraphs: newItems },
      };
    });
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          Professional Profile
          <span className="count-badge">{items.length}</span>
        </h2>
          {items.length === 0 && (
            <button onClick={openAddDrawer} className="neo-button-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Add Paragraph
            </button>
          )}

      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="item-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm text-muted-foreground line-clamp-3 rich-text-content"
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
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
                <button onClick={() => deleteItem(item.id)} className="action-btn">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No profile paragraphs yet. Click "Add Paragraph" to create one.
          </div>
        )}
      </div>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingItem ? 'Edit Paragraph' : 'Add Paragraph'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Paragraph Text</label>
            <div className="flex items-center gap-1 mb-2">
              <button
                type="button"
                className="action-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyCommand('bold')}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="action-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyCommand('italic')}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="action-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyCommand('strikeThrough')}
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="action-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyCommand('insertUnorderedList')}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="action-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyCommand('insertOrderedList')}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>
            <div
              ref={editorRef}
              className="neo-textarea min-h-[200px] rich-text-editor"
              contentEditable
              role="textbox"
              aria-multiline="true"
              suppressContentEditableWarning
              onInput={() => setFormData(getEditorHtml())}
              onKeyDown={(e) => {
                const isMod = e.ctrlKey || e.metaKey;
                if (!isMod) return;
                const key = e.key.toLowerCase();
                if (key === 'b') {
                  e.preventDefault();
                  applyCommand('bold');
                }
                if (key === 'i') {
                  e.preventDefault();
                  applyCommand('italic');
                }
                if (key === 'x' && e.shiftKey) {
                  e.preventDefault();
                  applyCommand('strikeThrough');
                }
              }}
              data-placeholder="Write about your professional background, expertise, and what makes you unique..."
            />
          </div>

          <button
            onClick={saveItem}
            className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            <Save className="w-4 h-4" />
            {editingItem ? 'Save Changes' : 'Add Paragraph'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
