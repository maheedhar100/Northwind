const KEY = 'northwind-session';

export function getSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function getInitials(session) {
  if (!session?.identifier) return 'NW';
  if (session.method === 'email') {
    const local = session.identifier.split('@')[0] || '';
    const parts = local.split(/[._-]/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return local.slice(0, 2).toUpperCase() || 'NW';
  }
  const digits = session.identifier.replace(/\D/g, '');
  return digits.slice(-2) || 'NW';
}
