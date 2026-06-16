import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { DEPARTMENTS } from '../data/employees';
import { Icons } from '../components/Icon';
import StatCards from '../components/StatCards';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import EmployeeTable from '../components/EmployeeTable';
import Pagination from '../components/Pagination';
import EmployeeForm from '../components/EmployeeForm';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { getInitials } from '../auth/session';
import * as api from '../api/employeeApi';
import '../App.css';

export default function DirectoryPage({ session, onSignOut }) {
  const initials = getInitials(session);

  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empError, setEmpError] = useState(null);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [menuId, setMenuId] = useState(null);
  const [panel, setPanel] = useState({ open: false, mode: 'add', initial: null });
  const [banner, setBanner] = useState(null);
  const [notice, setNotice] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const profileRef = useRef(null);

  const addToast = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const showComingSoon = (feature) => {
    setNotice(`${feature} is coming soon.`);
    setProfileOpen(false);
  };

  useEffect(() => {
    if (!profileOpen) return;
    const onDoc = (e) => profileRef.current && !profileRef.current.contains(e.target) && setProfileOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [profileOpen]);

  const fetchEmployees = useCallback(async () => {
    try {
      setEmpError(null);
      setEmpLoading(true);
      const { data } = await api.getEmployeesPaged({ page: 0, size: 1000, sortBy: 'name', direction: 'asc' });
      setEmployees(data.content);
    } catch {
      setEmpError('Could not load employees — check the backend is running on port 8080.');
    } finally {
      setEmpLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const [countRes, salaryRes, deptRes] = await Promise.all([
        api.getCount(),
        api.getAverageSalary(),
        api.getByDepartment(),
      ]);
      setStats({
        count: countRes.data,
        avgSalary: salaryRes.data,
        byDepartment: deptRes.data,
      });
    } catch {
      // non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, [fetchEmployees, fetchStats]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.searchEmployees(query.trim());
        setSearchResults(Array.isArray(data) ? data : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const baseList = searchResults ?? employees;

  const filtered = useMemo(() => {
    let list = baseList.filter((e) => {
      if (dept !== 'All' && e.department !== dept) return false;
      if (status !== 'All' && e.status !== status) return false;
      return true;
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (sort.key === 'salary') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [baseList, dept, status, sort]);

  useEffect(() => setPage(1), [dept, status, query, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const start = (curPage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const rangeStart = filtered.length === 0 ? 0 : start + 1;
  const rangeEnd = Math.min(start + pageSize, filtered.length);

  const onSort = (key) =>
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });

  const openAdd = () => setPanel({ open: true, mode: 'add', initial: null });
  const openEdit = (e) => setPanel({ open: true, mode: 'edit', initial: e });
  const closePanel = () => setPanel((p) => ({ ...p, open: false }));

  const saveEmployee = async (data) => {
    try {
      const mode = panel.mode;
      if (mode === 'edit') {
        await api.updateEmployee(panel.initial.id, data);
      } else {
        await api.createEmployee(data);
      }
      closePanel();
      fetchEmployees();
      fetchStats();
      addToast(mode === 'edit' ? 'Employee updated' : 'Employee added');
    } catch (error) {
      console.error('[saveEmployee]', error.response?.status, error.response?.data, error);
      throw error;
    }
  };

  const handleDelete = (e) => {
    setConfirmDialog({
      title: 'Remove employee',
      message: `Permanently remove ${e.name}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await api.deleteEmployee(e.id);
          fetchEmployees();
          fetchStats();
          addToast('Employee removed');
        } catch {
          setBanner('Failed to remove employee.');
        }
      },
    });
  };

  const handleDeactivate = async (e) => {
    try {
      await api.deactivateEmployee(e.id);
      fetchEmployees();
      addToast('Employee deactivated');
    } catch {
      setBanner('Failed to deactivate employee.');
    }
  };

  const clearFilters = () => { setQuery(''); setDept('All'); setStatus('All'); };
  const hasFilters = query || dept !== 'All' || status !== 'All';
  const tableLoading = empLoading || searchLoading;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">Northwind</span>
          <span className="brand-divider" />
          <span className="brand-section">People</span>
        </div>
        <nav className="topnav">
          <button type="button" className="topnav-link active">Directory</button>
          <button type="button" className="topnav-link" onClick={() => showComingSoon('Org chart')}>Org chart</button>
          <button type="button" className="topnav-link" onClick={() => showComingSoon('Compensation')}>Compensation</button>
          <button type="button" className="topnav-link" onClick={() => showComingSoon('Reports')}>Reports</button>
        </nav>
        <div className="topbar-right">
          <button type="button" className="icon-btn" title="Export" onClick={() => showComingSoon('Export')}>
            <Icons.download size={15} />
          </button>
          <div className="menu-anchor" ref={profileRef}>
            <button
              type="button"
              className="user-chip"
              title="Profile"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((o) => !o)}
            >
              {initials}
            </button>
            {profileOpen && (
              <div className="menu profile-menu">
                <div className="profile-menu-head">
                  <strong>Account</strong>
                  <span>{session.identifier}</span>
                </div>
                <button type="button" className="menu-item" onClick={() => showComingSoon('Profile')}>View profile</button>
                <button type="button" className="menu-item" onClick={() => showComingSoon('Settings')}>Settings</button>
                <button type="button" className="menu-item" onClick={() => { setProfileOpen(false); onSignOut(); }}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="content">
        {notice && (
          <div className="info-banner" role="status">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} aria-label="Dismiss">
              <Icons.close size={14} />
            </button>
          </div>
        )}

        {banner && (
          <div className="error-banner" role="alert">
            <span>{banner}</span>
            <button onClick={() => setBanner(null)} aria-label="Dismiss">
              <Icons.close size={14} />
            </button>
          </div>
        )}

        <div className="page-head">
          <div>
            <h1 className="page-title">Employees</h1>
            <p className="page-desc">Manage your organization's directory, roles, and compensation.</p>
          </div>
          <button className="btn primary" onClick={openAdd}>
            <Icons.plus size={15} /> Add employee
          </button>
        </div>

        <StatCards stats={stats} employees={employees} loading={statsLoading} />

        <div className="table-card">
          <div className="toolbar">
            <SearchBar value={query} onChange={setQuery} />
            <div className="toolbar-filters">
              <FilterSelect label="Department" value={dept} options={DEPARTMENTS} onChange={setDept} />
              <FilterSelect label="Status" value={status} options={['Active', 'Inactive']} onChange={setStatus} />
              {hasFilters && <button className="btn ghost sm" onClick={clearFilters}>Clear</button>}
            </div>
            <div className="toolbar-spacer" />
            {!tableLoading && (
              <div className="result-count">{filtered.length} result{filtered.length === 1 ? '' : 's'}</div>
            )}
          </div>

          {empError ? (
            <div className="table-message">
              <span>{empError}</span>
              <button className="btn ghost sm" onClick={fetchEmployees}>Retry</button>
            </div>
          ) : (
            <EmployeeTable
              rows={pageRows}
              sort={sort}
              onSort={onSort}
              onEdit={openEdit}
              onDelete={handleDelete}
              onDeactivate={handleDeactivate}
              menuId={menuId}
              setMenuId={setMenuId}
              loading={tableLoading}
            />
          )}

          <Pagination
            page={curPage}
            totalPages={totalPages}
            pageSize={pageSize}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={filtered.length}
            onPage={setPage}
            onPageSize={setPageSize}
          />
        </div>
      </main>

      <EmployeeForm
        open={panel.open}
        mode={panel.mode}
        initial={panel.initial}
        onClose={closePanel}
        onSave={saveEmployee}
      />

      <ConfirmDialog dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
      <Toast toasts={toasts} />
    </div>
  );
}
