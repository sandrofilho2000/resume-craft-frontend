import { Drawer } from "@/components/Drawer";
import { useResumeContext } from "@/contexts/ResumeContext";
import {
  Bold,
  Edit2,
  Italic,
  List,
  ListOrdered,
  Save,
  Strikethrough,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const ProfileEditor = () => {
  const { resume, updateProfile, saveStatus } = useResumeContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState<string>("");

  const editorRef = useRef<HTMLDivElement | null>(null);

  const profile = resume?.profileSection;

  const getEditorHtml = () => {
    if (!editorRef.current) return "";
    const text = editorRef.current.textContent?.trim() ?? "";
    if (!text) return "";
    return editorRef.current.innerHTML;
  };

  const applyCommand = (command: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command);
    setFormData(getEditorHtml());
  };

  const openEditDrawer = () => {
    setDrawerOpen(true);
  };

  useEffect(() => {
    if (!drawerOpen) return;
    if (!editorRef.current) return;

    const current = profile?.content ?? "";
    setFormData(current);
    editorRef.current.innerHTML = current;
  }, [drawerOpen, profile?.content]);

  const saveProfile = () => {
    
    console.log("🚀 ~ saveProfile ~ formData:", formData)
    console.log("🚀 ~ saveProfile ~ updateProfile:", updateProfile)

    const nextContent = formData;

    // ✅ não muda estado local aqui; só delega pro hook
    updateProfile({
      resumeId: profile?.resumeId ?? resume.id,
      ...(profile?.id ? { id: profile.id } : {}),
      ...(profile?.title ? { title: profile.title } : {}),
      content: nextContent,
    });

    setDrawerOpen(false);
  };


  if (!resume) return null;

  return (
    <div className="space-y-6 fade-in">
      <div className="section-header">
        <h2 className="section-title">
          {profile?.title ?? "Professional Profile"}
          <span className="count-badge">1</span>
        </h2>

        <button
          onClick={openEditDrawer}
          disabled={saveStatus === "saving"}
          className="neo-button-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="space-y-3">
        <div className="item-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {profile?.content ? (
                <div
                  className="text-sm text-muted-foreground line-clamp-6 rich-text-content"
                  dangerouslySetInnerHTML={{ __html: profile.content }}
                />
              ) : (
                <div className="text-sm text-muted-foreground">
                  No profile content yet. Click “Edit” to add your professional profile.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Edit Professional Profile"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Profile Content
            </label>

            <div className="flex items-center gap-1 mb-2">
              <button
                type="button"
                className="action-btn"
                onMouseDown={e => e.preventDefault()}
                onClick={() => applyCommand("bold")}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="action-btn"
                onMouseDown={e => e.preventDefault()}
                onClick={() => applyCommand("italic")}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="action-btn"
                onMouseDown={e => e.preventDefault()}
                onClick={() => applyCommand("strikeThrough")}
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="action-btn"
                onMouseDown={e => e.preventDefault()}
                onClick={() => applyCommand("insertUnorderedList")}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="action-btn"
                onMouseDown={e => e.preventDefault()}
                onClick={() => applyCommand("insertOrderedList")}
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
              onKeyDown={e => {
                const isMod = e.ctrlKey || e.metaKey;
                if (!isMod) return;

                const key = e.key.toLowerCase();
                if (key === "b") {
                  e.preventDefault();
                  applyCommand("bold");
                }
                if (key === "i") {
                  e.preventDefault();
                  applyCommand("italic");
                }
                if (key === "x" && e.shiftKey) {
                  e.preventDefault();
                  applyCommand("strikeThrough");
                }
              }}
              data-placeholder="Write about your professional background, expertise, and what makes you unique..."
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={saveStatus === "saving"}
            className="neo-button-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </Drawer>
    </div>
  );
};
