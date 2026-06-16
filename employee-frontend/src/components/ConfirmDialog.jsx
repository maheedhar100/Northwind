import { useEffect } from 'react';

export default function ConfirmDialog({ dialog, onCancel }) {
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, onCancel]);

  if (!dialog) return null;

  return (
    <div className="dialog-root" role="dialog" aria-modal="true" aria-label={dialog.title}>
      <div className="dialog-scrim" onClick={onCancel} />
      <div className="dialog">
        <div className="dialog-head">
          <div className="dialog-title">{dialog.title}</div>
        </div>
        <div className="dialog-body">
          <p>{dialog.message}</p>
        </div>
        <div className="dialog-foot">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn danger" onClick={dialog.onConfirm}>Remove</button>
        </div>
      </div>
    </div>
  );
}
