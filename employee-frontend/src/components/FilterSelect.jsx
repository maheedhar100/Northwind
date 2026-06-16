import { useState, useEffect, useRef } from 'react';
import { Icons } from './Icon';

export default function FilterSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const active = value !== 'All';

  return (
    <div className="filter" ref={ref}>
      <button className={'filter-btn' + (active ? ' active' : '')} onClick={() => setOpen((o) => !o)}>
        <span className="filter-label">{label}</span>
        <span className="filter-value">{value}</span>
        <Icons.chevronDown size={14} />
      </button>
      {open && (
        <div className="dropdown">
          {['All', ...options].map((opt) => (
            <button
              key={opt}
              className={'dropdown-item' + (opt === value ? ' selected' : '')}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              <span>{opt}</span>
              {opt === value && <Icons.check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
