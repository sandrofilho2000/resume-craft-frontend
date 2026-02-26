import { Drawer } from '@/components/Drawer';
import { openConfirmActionDialog } from '@/components/ConfirmActionDialog';
import { useResumeContext } from '@/contexts/ResumeContext';
import { SkillsItem, SkillsSubSection } from '@/types/skills.types';
import { ChevronDown, ChevronUp, Copy, Edit2, Plus, PlusCircle, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type SkillGroupForm = {
  title: string;
  skills: SkillsItem[];
};

const ensureSkillsArray = (skills?: SkillsItem[] | null): SkillsItem[] => (Array.isArray(skills) ? skills : []);
const ensureSubsectionsArray = (subsections?: SkillsSubSection[] | null): SkillsSubSection[] =>
  Array.isArray(subsections) ? subsections : [];

export const SkillsEditor = () => {
  const { resume, updateSkills, saveStatus } = useResumeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SkillsSubSection | null>(null);
  const [formData, setFormData] = useState<SkillGroupForm>({ title: '', skills: [] });

  useEffect(()=>{
    console.log("🚀 ~ SkillsEditor ~ resume:", resume)
  }, [resume])

  if (!resume?.skillSection) return null;

  const subsections = ensureSubsectionsArray(resume.skillSection.subsections);

  const sortSkills = (skills?: SkillsItem[] | null) => [...ensureSkillsArray(skills)].sort((a, b) => a.order - b.order);
  const normalizeSubsections = (items: SkillsSubSection[]) =>
    ensureSubsectionsArray(items).map((item, index) => ({
      ...item,
      order: index,
      skills: sortSkills(item.skills).map((skill, skillIndex) => ({ ...skill, order: skillIndex, subSectionId: item.id })),
    }));

  const commitSkills = (nextSubsections: SkillsSubSection[]) => {
    updateSkills({
      ...resume.skillSection,
      resumeId: resume.skillSection.resumeId ?? resume.id,
      subsections: normalizeSubsections(nextSubsections),
    });
  };

  const openAddDrawer = () => {
    setEditingItem(null);
    setFormData({ title: '', skills: [] });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: SkillsSubSection) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      skills: sortSkills(item.skills).map((skill) => ({ ...skill })),
    });
    setDrawerOpen(true);
  };

  const getNextSubsectionId = (items: SkillsSubSection[]) =>
    items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

  const getNextSkillId = (items: SkillsSubSection[]) => {
    const allSkills = ensureSubsectionsArray(items).flatMap((item) => ensureSkillsArray(item.skills));
    return allSkills.length > 0 ? Math.max(...allSkills.map((skill) => skill.id)) + 1 : 1;
  };

  const normalizeSkillsForGroup = (groupId: number, skills: SkillsItem[]) =>
    skills
      .map((skill) => ({ ...skill, name: skill.name.trim() }))
      .filter((skill) => skill.name.length > 0)
      .map((skill, index) => ({
        ...skill,
        order: index,
        subSectionId: groupId,
      }));

  const saveItem = () => {
    const currentSubsections = ensureSubsectionsArray(resume.skillSection.subsections);
    const groupId = editingItem?.id ?? getNextSubsectionId(currentSubsections);
    const normalizedSkills = normalizeSkillsForGroup(groupId, formData.skills);

    const nextSubsections = editingItem
      ? currentSubsections.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                title: formData.title,
                skills: normalizedSkills,
              }
            : item,
        )
      : [
          ...currentSubsections,
          {
            id: groupId,
            title: formData.title,
            order: currentSubsections.length,
            skillsSectionId: resume.skillSection.id,
            skills: normalizedSkills,
          },
        ];

    commitSkills(nextSubsections);

    setDrawerOpen(false);
  };

  const duplicateItem = (item: SkillsSubSection) => {
    const currentSubsections = ensureSubsectionsArray(resume.skillSection.subsections);
    const nextSubsectionId = getNextSubsectionId(currentSubsections);
    let nextSkillId = getNextSkillId(currentSubsections);

    const duplicatedSkills = sortSkills(item.skills).map((skill, index) => ({
      ...skill,
      id: nextSkillId++,
      order: index,
      subSectionId: nextSubsectionId,
    }));

    const duplicatedGroup: SkillsSubSection = {
      ...item,
      id: nextSubsectionId,
      order: currentSubsections.length,
      skillsSectionId: resume.skillSection.id,
      title: item.title,
      skills: duplicatedSkills,
    };

    commitSkills([...currentSubsections, duplicatedGroup]);
  };

  const deleteItem = (id: number) => {
    openConfirmActionDialog({
      title: 'Delete skill group',
      message: 'Are you sure you want to delete this skill group?',
      confirmLabel: 'Delete',
      onConfirm: () => {
        const nextSubsections = ensureSubsectionsArray(resume.skillSection.subsections).filter((item) => item.id !== id);
        commitSkills(nextSubsections);
      },
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= subsections.length) return;

    const newItems = [...subsections];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    commitSkills(newItems);
  };

  const addSkill = () => {
    const nextId = formData.skills.length > 0 ? Math.max(...formData.skills.map((skill) => skill.id)) + 1 : 1;
    const currentGroupId = editingItem?.id ?? 0;

    setFormData((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: nextId,
          name: '',
          order: prev.skills.length,
          subSectionId: currentGroupId,
        },
      ],
    }));
  };

  const updateSkill = (id: number, name: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) => (skill.id === id ? { ...skill, name } : skill)),
    }));
  };

  const removeSkill = (id: number) => {
    openConfirmActionDialog({
      title: 'Delete skill',
      message: 'Remove this skill from the group?',
      confirmLabel: 'Delete',
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          skills: prev.skills
            .filter((skill) => skill.id !== id)
            .map((skill, index) => ({ ...skill, order: index })),
        }));
      },
    });
  };

  const moveSkill = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.skills.length) return;

    setFormData((prev) => {
      const newSkills = [...prev.skills];
      [newSkills[index], newSkills[newIndex]] = [newSkills[newIndex], newSkills[index]];
      return {
        ...prev,
        skills: newSkills.map((skill, idx) => ({ ...skill, order: idx })),
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
        <button
          onClick={openAddDrawer}
          disabled={saveStatus === 'saving'}
          className="neo-button-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
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
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {sortSkills(subsection.skills)
                    .map((skill) => skill.name)
                    .join(', ') || 'No skills added'}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => moveItem(index, 'up')} disabled={index === 0 || saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveItem(index, 'down')} disabled={index === subsections.length - 1 || saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button onClick={() => openEditDrawer(subsection)} disabled={saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => duplicateItem(subsection)} disabled={saveStatus === 'saving'} className="action-btn disabled:opacity-30">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(subsection.id)} disabled={saveStatus === 'saving'} className="action-btn-danger disabled:opacity-30">
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
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="neo-input"
              placeholder="e.g., Frontend, Backend, DevOps"
            />
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-muted-foreground">Skills</label>
              <button onClick={addSkill} className="neo-button text-xs flex items-center gap-1" type="button">
                <PlusCircle className="w-3 h-3" />
                Add Skill
              </button>
            </div>

            <div className="space-y-2">
              {formData.skills.map((skill, index) => (
                <div key={skill.id} className="flex items-start gap-2">
                  <span className="text-primary mt-3">*</span>
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, e.target.value)}
                    className="neo-input flex-1 py-2 text-sm"
                    placeholder="e.g., React, NestJS, Prisma"
                  />
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveSkill(index, 'up')} disabled={index === 0} className="action-btn disabled:opacity-30 p-1" type="button">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveSkill(index, 'down')} disabled={index === formData.skills.length - 1} className="action-btn disabled:opacity-30 p-1" type="button">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeSkill(skill.id)} className="action-btn-danger mt-2" type="button">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {formData.skills.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">No skills yet. Click "Add Skill" to add items.</p>
              )}
            </div>
          </div>

          <button
            onClick={saveItem}
            disabled={saveStatus === 'saving'}
            className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {editingItem ? 'Save Changes' : 'Add Skill Group'}
          </button>
        </div>
      </Drawer>
    </div>
  );
};
