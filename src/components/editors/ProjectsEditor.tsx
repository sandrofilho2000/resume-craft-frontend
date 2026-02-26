import { openConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { Drawer } from '@/components/Drawer';
import { useResumeContext } from '@/contexts/ResumeContext';
import { ProjectItem } from '@/types/projects.types';
import { Bold, ChevronDown, ChevronUp, Copy, Edit2, Italic, List, ListOrdered, Plus, Save, Strikethrough, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ProjectForm = Omit<ProjectItem, 'id' | 'order' | 'sectionId'>;

const ensureProjectsArray = (items?: ProjectItem[] | null): ProjectItem[] =>
  Array.isArray(items) ? items : [];

export const ProjectsEditor = () => {
  const { resume, updateProjects, saveStatus } = useResumeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [formData, setFormData] = useState<ProjectForm>({ name: '', description: '' });
  const editorRef = useRef<HTMLDivElement | null>(null);

  const projectsSection = resume?.projectsSection;
  const sortProjects = (items?: ProjectItem[] | null) => [...ensureProjectsArray(items)].sort((a, b) => a.order - b.order);

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
    setFormData((prev) => ({ ...prev, description: getEditorHtml() }));
  };

  const commitProjects = (nextItems: ProjectItem[]) => {
    updateProjects({
      ...projectsSection,
      resumeId: projectsSection.resumeId ?? resume.id,
      projects: nextItems.map((item, index) => ({
        ...item,
        order: index,
        sectionId: projectsSection.id,
      })),
    });
  };

  const getNextProjectId = (projects: ProjectItem[]) =>
    projects.length > 0 ? Math.max(...projects.map((item) => item.id)) + 1 : 1;

  const openAddDrawer = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '' });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: ProjectItem) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description });
    setDrawerOpen(true);
  };

  useEffect(() => {
    if (!drawerOpen) return;
    if (!editorRef.current) return;
    if (!projectsSection) return;

    const current = editingItem?.description ?? '';
    editorRef.current.innerHTML = current;
  }, [drawerOpen, editingItem?.id, projectsSection]);

  if (!resume || !projectsSection) return null;

  const items = sortProjects(projectsSection.projects);

  const saveItem = () => {
    const currentItems = sortProjects(projectsSection.projects);
    const nextId = editingItem?.id ?? getNextProjectId(currentItems);

    const nextItem: ProjectItem = {
      id: nextId,
      name: formData.name,
      description: formData.description,
      order: editingItem?.order ?? currentItems.length,
      sectionId: projectsSection.id,
    };

    const nextItems = editingItem
      ? currentItems.map((item) => (item.id === editingItem.id ? nextItem : item))
      : [...currentItems, nextItem];

    commitProjects(nextItems);
    setDrawerOpen(false);
  };

  const duplicateItem = (item: ProjectItem) => {
    const currentItems = sortProjects(projectsSection.projects);
    const nextId = getNextProjectId(currentItems);

    const duplicated: ProjectItem = {
      ...item,
      id: nextId,
      order: currentItems.length,
      sectionId: projectsSection.id,
    };

    commitProjects([...currentItems, duplicated]);
  };

  const deleteItem = (id: number) => {
    openConfirmActionDialog({
      title: 'Delete project',
      message: 'Are you sure you want to delete this project?',
      confirmLabel: 'Delete',
      onConfirm: () => {
        const nextItems = sortProjects(projectsSection.projects).filter((item) => item.id !== id);
        commitProjects(nextItems);
      },
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const nextItems = [...items];
    [nextItems[index], nextItems[newIndex]] = [nextItems[newIndex], nextItems[index]];
    commitProjects(nextItems);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          {projectsSection.title || 'Projects'}
          <span className="count-badge">{items.length}</span>
        </h2>
        <button
          onClick={openAddDrawer}
          disabled={saveStatus === 'saving'}
          className="neo-button-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
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
                {item.description ? (
                  <div
                    className="text-sm text-muted-foreground line-clamp-3 rich-text-content"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground line-clamp-2">No description</p>
                )}
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
            No projects yet. Click "Add Project" to create one.
          </div>
        )}
      </div>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingItem ? 'Edit Project' : 'Add Project'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="neo-input"
              placeholder="e.g., E-commerce Platform"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
            <div className="flex items-center gap-1 mb-2">
              <button type="button" className="action-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('bold')} title="Bold (Ctrl+B)">
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" className="action-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('italic')} title="Italic (Ctrl+I)">
                <Italic className="w-4 h-4" />
              </button>
              <button type="button" className="action-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('strikeThrough')} title="Strikethrough">
                <Strikethrough className="w-4 h-4" />
              </button>
              <button type="button" className="action-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('insertUnorderedList')} title="Bullet List">
                <List className="w-4 h-4" />
              </button>
              <button type="button" className="action-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand('insertOrderedList')} title="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            <div
              ref={editorRef}
              className="neo-textarea min-h-[180px] rich-text-editor"
              contentEditable
              role="textbox"
              aria-multiline="true"
              suppressContentEditableWarning
              onInput={() => setFormData((prev) => ({ ...prev, description: getEditorHtml() }))}
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
              data-placeholder="Describe the project, technologies used, and your role..."
            />
          </div>

          <button
            onClick={saveItem}
            disabled={saveStatus === 'saving'}
            className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {editingItem ? 'Save Changes' : 'Add Project'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
