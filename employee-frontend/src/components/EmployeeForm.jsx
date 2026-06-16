import { useState, useEffect } from 'react';
import { Icons } from './Icon';
import { DEPARTMENTS, ROLES_BY_DEPT } from '../data/employees';

function PanelField({ label, children, error, hint }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

const BLANK = {
  name: '', email: '', department: DEPARTMENTS[0], role: '',
  salary: '', status: 'Active', location: 'Remote — US',
  hireDate: new Date().toISOString().slice(0, 10),
};

// onSave is async and throws on API error so this component can show it in-panel.
export default function EmployeeForm({ open, mode, initial, onClose, onSave }) {
  const [form,      setForm]      = useState(BLANK);
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial, salary: String(initial.salary) } : BLANK);
      setErrors({});
      setSaving(false);
      setSaveError('');
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && !saving && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, saving]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const roleOptions = ROLES_BY_DEPT[form.department] || [];

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) er.email = 'Enter a valid email';
    const sal = Number(form.salary);
    if (!form.salary || isNaN(sal) || sal <= 0) er.salary = 'Enter a valid amount';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSave({ ...form, salary: Number(form.salary) });
    } catch (err) {
      console.error('[EmployeeForm] save error – status:', err?.response?.status, 'body:', err?.response?.data, err);
      const body = err?.response?.data;
      const msg =
        (typeof body === 'string' ? body : null) ||
        body?.message ||
        body?.error ||
        body?.errors?.[0]?.defaultMessage ||
        (err?.response?.status ? `Server error ${err.response.status}` : null) ||
        'Failed to save. Please try again.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={'panel-root' + (open ? ' open' : '')} aria-hidden={!open}>
      <div className="panel-scrim" onClick={saving ? undefined : onClose} />
      <aside className="panel" role="dialog" aria-modal="true" aria-label={mode === 'edit' ? 'Edit employee' : 'Add employee'}>
        <header className="panel-head">
          <div>
            <div className="panel-title">{mode === 'edit' ? 'Edit employee' : 'Add employee'}</div>
            <div className="panel-sub">{mode === 'edit' ? initial?.id : 'New record'}</div>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={saving} aria-label="Close">
            <Icons.close size={17} />
          </button>
        </header>

        <div className="panel-body">
          <PanelField label="Full name" error={errors.name}>
            <input
              className={'input' + (errors.name ? ' invalid' : '')}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Jane Cooper"
              disabled={saving}
            />
          </PanelField>

          <PanelField label="Email" error={errors.email}>
            <input
              className={'input' + (errors.email ? ' invalid' : '')}
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="jane@northwind.io"
              disabled={saving}
            />
          </PanelField>

          <div className="field-grid">
            <PanelField label="Department">
              <div className="select-wrap">
                <select className="input" value={form.department} onChange={(e) => set('department', e.target.value)} disabled={saving}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <Icons.chevronDown size={15} />
              </div>
            </PanelField>
            <PanelField label="Role">
              <div className="select-wrap">
                <select className="input" value={form.role} onChange={(e) => set('role', e.target.value)} disabled={saving}>
                  <option value="">Select role…</option>
                  {roleOptions.map((r) => <option key={r}>{r}</option>)}
                </select>
                <Icons.chevronDown size={15} />
              </div>
            </PanelField>
          </div>

          <div className="field-grid">
            <PanelField label="Annual salary" error={errors.salary}>
              <div className="input-prefix-wrap">
                <span className="input-prefix">₹</span>
                <input
                  className={'input has-prefix' + (errors.salary ? ' invalid' : '')}
                  value={form.salary}
                  onChange={(e) => set('salary', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="120000"
                  inputMode="numeric"
                  disabled={saving}
                />
              </div>
            </PanelField>
            <PanelField label="Status">
              <div className="select-wrap">
                <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)} disabled={saving}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <Icons.chevronDown size={15} />
              </div>
            </PanelField>
          </div>

          <div className="field-grid">
            <PanelField label="Location">
              <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Remote — US" disabled={saving} />
            </PanelField>
            <PanelField label="Hire date">
              <input type="date" className="input" value={form.hireDate} onChange={(e) => set('hireDate', e.target.value)} disabled={saving} />
            </PanelField>
          </div>
        </div>

        <footer className="panel-foot">
          {saveError && <span className="field-error save-error">{saveError}</span>}
          <button className="btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add employee'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
