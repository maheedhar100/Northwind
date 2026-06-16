import { Icons } from './Icon';

const AVATAR_PALETTE = [
  ['#dbeafe', '#1e40af'],
  ['#d1fae5', '#065f46'],
  ['#fce7f3', '#9d174d'],
  ['#fef3c7', '#92400e'],
  ['#ede9fe', '#5b21b6'],
  ['#fee2e2', '#991b1b'],
  ['#e0f2fe', '#0369a1'],
  ['#ecfdf5', '#166534'],
];

function avatarStyle(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h * 31) + name.charCodeAt(i)) | 0;
  const [bg, color] = AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
  return { background: bg, color };
}

function formatINR(n) {
  if (n == null) return '—';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function StatusPill({ status }) {
  const active = status === 'Active';
  return (
    <span className={'pill ' + (active ? 'pill-active' : 'pill-inactive')}>
      <span className="pill-dot" />
      {status}
    </span>
  );
}

const BASE_COLS = [
  { key: 'name',       label: 'Name',       sortable: true  },
  { key: 'email',      label: 'Email',      sortable: true  },
  { key: 'department', label: 'Department', sortable: true  },
  { key: 'location',   label: 'Location',   sortable: true  },
  { key: 'salary',     label: 'Salary',     sortable: true,  align: 'right' },
  { key: 'status',     label: 'Status',     sortable: true  },
];
const ACTION_COL = { key: 'actions', label: '', sortable: false, align: 'right' };
const COLS = [...BASE_COLS, ACTION_COL];

function SortIcon({ col, sort }) {
  if (sort.key !== col) return <Icons.sort size={12} className="sort-idle" />;
  return sort.dir === 'asc' ? <Icons.sortUp size={12} /> : <Icons.sortDown size={12} />;
}

function SkeletonRow() {
  return (
    <tr className="skeleton-row">
      <td>
        <div className="name-cell">
          <div className="avatar skeleton" style={{ width: 28, height: 28, minWidth: 28 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div className="skeleton" style={{ width: 108, height: 11 }} />
            <div className="skeleton" style={{ width: 64, height: 9 }} />
          </div>
        </div>
      </td>
      <td><div className="skeleton" style={{ width: 140, height: 11 }} /></td>
      <td><div className="skeleton" style={{ width: 76, height: 18, borderRadius: 3 }} /></td>
      <td><div className="skeleton" style={{ width: 88, height: 11 }} /></td>
      <td className="ta-right"><div className="skeleton" style={{ width: 64, height: 11, marginLeft: 'auto' }} /></td>
      <td><div className="skeleton" style={{ width: 56, height: 18, borderRadius: 10 }} /></td>
      <td />
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </span>
      <div className="empty-state-msg">No employees found</div>
      <div className="empty-state-sub">Try adjusting your search or filter criteria.</div>
    </div>
  );
}

export default function EmployeeTable({
  rows, sort, onSort, onEdit, onDelete, onDeactivate,
  menuId, setMenuId, loading = false,
}) {
  return (
    <div className="table-wrap">
      <table className="emp-table">
        <thead>
          <tr>
            {COLS.map((c) => (
              <th
                key={c.key}
                className={(c.align === 'right' ? 'ta-right ' : '') + (c.sortable ? 'sortable' : '')}
                onClick={c.sortable ? () => onSort(c.key) : undefined}
              >
                <span className="th-inner">
                  {c.label}
                  {c.sortable && <SortIcon col={c.key} sort={sort} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && rows.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : rows.length === 0 ? (
            <tr className="empty-row">
              <td colSpan={COLS.length}>
                <EmptyState />
              </td>
            </tr>
          ) : (
            rows.map((e) => {
              const initials = e.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
              return (
                <tr key={e.id}>
                  <td>
                    <div className="name-cell">
                      <span className="avatar" style={avatarStyle(e.name)}>{initials}</span>
                      <div className="name-meta">
                        <span className="name-primary">{e.name}</span>
                        <span className="name-secondary">{e.role || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="cell-muted">{e.email}</td>
                  <td><span className="dept-chip">{e.department}</span></td>
                  <td className="cell-muted">{e.location || '—'}</td>
                  <td className="ta-right cell-num">{formatINR(e.salary)}</td>
                  <td><StatusPill status={e.status} /></td>
                  <td className="ta-right">
                    <div className="row-actions">
                      <button className="icon-btn sm" title="Edit" onClick={() => onEdit(e)}>
                        <Icons.edit size={14} />
                      </button>
                      <div className="menu-anchor">
                        <button
                          className="icon-btn sm"
                          title="More"
                          onClick={() => setMenuId(menuId === e.id ? null : e.id)}
                        >
                          <Icons.more size={14} />
                        </button>
                        {menuId === e.id && (
                          <div className="menu" onMouseLeave={() => setMenuId(null)}>
                            <button className="menu-item" onClick={() => { onEdit(e); setMenuId(null); }}>
                              <Icons.edit size={14} /> Edit details
                            </button>
                            {e.status === 'Active' && (
                              <button className="menu-item" onClick={() => { onDeactivate(e); setMenuId(null); }}>
                                <Icons.dot size={14} /> Deactivate
                              </button>
                            )}
                            <button className="menu-item danger" onClick={() => { onDelete(e); setMenuId(null); }}>
                              <Icons.trash size={14} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
