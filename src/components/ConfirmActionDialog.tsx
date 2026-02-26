import { ReactNode } from 'react';
import { confirmAlert } from 'react-confirm-alert';

type ConfirmActionDialogProps = {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmActionDialog = ({
  title = 'Confirm action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onCancel,
  onConfirm,
}: ConfirmActionDialogProps) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/80 p-4">
      <div className="glass-card w-full max-w-md rounded-xl border border-border p-5 shadow-xl">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <div className="mt-2 text-sm text-muted-foreground">{message}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="neo-button">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="action-btn-danger px-3 py-2">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

type OpenConfirmActionDialogOptions = {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
};

export const openConfirmActionDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: OpenConfirmActionDialogOptions) => {
  confirmAlert({
    customUI: ({ onClose }) => (
      <ConfirmActionDialog
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onCancel={onClose}
        onConfirm={() => {
          onConfirm();
          onClose();
        }}
      />
    ),
  });
};

export default ConfirmActionDialog;
