import { Icons } from './Icon';

function formatINR(n) {
  if (n == null) return null;
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default function StatCards({ stats, employees, loading }) {
  const activeCount   = employees.filter((e) => e.status === 'Active').length;
  const inactiveCount = employees.length - activeCount;

  const byDept      = stats?.byDepartment ?? {};
  const deptEntries = Object.entries(byDept).sort((a, b) => b[1] - a[1]);
  const topDept     = deptEntries[0] ?? ['—', 0];
  const deptCount   = deptEntries.length;

  const fmtCount = (n) => (n != null ? Number(n).toLocaleString('en-IN') : null);

  const cards = [
    {
      label: 'Total employees',
      value: fmtCount(stats?.count),
      sub:   stats?.count != null ? `${activeCount} active · ${inactiveCount} inactive` : null,
      icon: Icons.users,
    },
    {
      label: 'Average salary',
      value: formatINR(stats?.avgSalary),
      sub:   'Across all departments',
      icon: Icons.wallet,
    },
    {
      label: 'Largest department',
      value: topDept[0] !== '—' ? topDept[0] : null,
      sub:   topDept[1] ? `${topDept[1]} people` : null,
      icon: Icons.building,
    },
    {
      label: 'Departments',
      value: deptCount ? String(deptCount) : null,
      sub:   deptCount && stats?.count
               ? `${(Number(stats.count) / deptCount).toFixed(1)} avg headcount`
               : null,
      icon: Icons.pulse,
    },
  ];

  return (
    <div className="stat-row">
      {cards.map((c) => {
        const I = c.icon;
        return (
          <div className={'stat-card' + (loading ? ' stat-loading' : '')} key={c.label}>
            <div className="stat-head">
              <span className="stat-label">{c.label}</span>
              <span className="stat-icon"><I size={14} /></span>
            </div>
            {loading ? (
              <>
                <div className="skeleton stat-skeleton-value" />
                <div className="skeleton stat-skeleton-sub" />
              </>
            ) : (
              <>
                <div className="stat-value">{c.value ?? '—'}</div>
                <div className="stat-sub">{c.sub ?? '—'}</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
