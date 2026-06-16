export default function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-region" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className="toast">{t.msg}</div>
      ))}
    </div>
  );
}
