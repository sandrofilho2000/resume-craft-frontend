import { createResume } from '@/api/resume.api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useResumeContext } from '@/contexts/ResumeContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type CreateResumeDialogProps = {
  triggerClassName?: string;
  triggerLabel?: string;
};

type CreateResumeForm = {
  name: string;
  job_title: string;
  company_name: string;
};

const emptyForm: CreateResumeForm = {
  name: '',
  job_title: '',
  company_name: '',
};

export const CreateResumeDialog = ({
  triggerClassName = 'neo-button-primary flex items-center gap-2 text-sm',
  triggerLabel = 'New resume',
}: CreateResumeDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setResume, setActiveSection } = useResumeContext();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CreateResumeForm>(emptyForm);

  const canSubmit = form.name.trim().length > 0 && !isSubmitting;

  const resetForm = () => {
    setForm(emptyForm);
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const created = await createResume({
        name: form.name.trim(),
        job_title: form.job_title.trim() || undefined,
        company_name: form.company_name.trim() || undefined,
      });

      if (!created?.id) {
        throw new Error('Create resume API did not return the resume id.');
      }

      setActiveSection('header');
      setResume(undefined as any);
      setOpen(false);

      toast({
        title: 'Resume created',
        description: 'Opening the editor so you can continue editing.',
      });

      navigate(`/resumes/${created.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create the resume.';
      toast({
        title: 'Error creating resume',
        description: message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        <Plus className="w-4 h-4" />
        {triggerLabel}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create new resume</DialogTitle>
            <DialogDescription>
              Fill in the minimum information to create the record and open the editor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Resume name</label>
              <input
                autoFocus
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="neo-input"
                placeholder="e.g., Resume for Nubank"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Target role (optional)</label>
              <input
                type="text"
                value={form.job_title}
                onChange={(e) => setForm((prev) => ({ ...prev, job_title: e.target.value }))}
                className="neo-input"
                placeholder="e.g., Frontend Developer"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Company (optional)</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => setForm((prev) => ({ ...prev, company_name: e.target.value }))}
                className="neo-input"
                placeholder="e.g., Nubank"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              className="neo-button"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="neo-button-primary flex items-center gap-2"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create and edit
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateResumeDialog;
