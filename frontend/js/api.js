/* =============================================================
   api.js — Central API client for Placement Tracker Frontend
   ============================================================= */

const API_BASE = 'http://localhost:5000/api';

// ── Token helpers ──────────────────────────────────────────────
const getToken     = () => localStorage.getItem('pt_token');
const getRole      = () => localStorage.getItem('pt_role');
const getUserId    = () => localStorage.getItem('pt_userId');
const getStudentId = () => localStorage.getItem('pt_studentId');

function saveSession({ token, role, userId, studentId }) {
  localStorage.setItem('pt_token',     token);
  localStorage.setItem('pt_role',      role);
  localStorage.setItem('pt_userId',    userId);
  localStorage.setItem('pt_studentId', studentId || '');
}

function clearSession() {
  ['pt_token','pt_role','pt_userId','pt_studentId'].forEach(k => localStorage.removeItem(k));
}

// ── Auth redirect helpers ──────────────────────────────────────
// Resolves the login page path relative to the current HTML page location.
// Works correctly whether served via a dev server OR opened as a file://.
function _loginPath() {
  const path = window.location.pathname;
  // Pages in /student/ or /admin/ sub-folders need to go up one level
  if (path.includes('/student/') || path.includes('/admin/')) {
    return '../index.html';
  }
  return 'index.html';
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = _loginPath();
    return false;
  }
  return true;
}

function requireRole(role) {
  if (!requireAuth()) return false;
  if (getRole() !== role) {
    // Redirect to the correct dashboard for the actual role
    const currentPath = window.location.pathname;
    const actualRole  = getRole();
    if (actualRole === 'Admin') {
      window.location.href = currentPath.includes('/student/') ? '../admin/dashboard.html' : 'admin/dashboard.html';
    } else {
      window.location.href = currentPath.includes('/admin/') ? '../student/dashboard.html' : 'student/dashboard.html';
    }
    return false;
  }
  return true;
}

// ── Core fetch wrapper ─────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(API_BASE + path, { headers, ...options });
    const data = await res.json().catch(() => ({ success: false, message: 'Invalid response from server.' }));

    if (res.status === 401) {
      clearSession();
      window.location.href = _loginPath();
      return;
    }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    // Network error (server down, CORS, etc.)
    return { ok: false, status: 0, data: { success: false, message: 'Cannot connect to server. Is the backend running?' } };
  }
}

// ── Auth ───────────────────────────────────────────────────────
const Auth = {
  login:    (body) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout() {
    clearSession();
    window.location.href = _loginPath();
  },
};

// ── Students ───────────────────────────────────────────────────
const Students = {
  getAll:  ()       => apiFetch('/students'),
  getById: (id)     => apiFetch(`/students/${id}`),
  update:  (id, b)  => apiFetch(`/students/${id}`, { method: 'PUT',    body: JSON.stringify(b) }),
  delete:  (id)     => apiFetch(`/students/${id}`, { method: 'DELETE' }),
};

// ── Companies ──────────────────────────────────────────────────
const Companies = {
  getAll:      ()       => apiFetch('/companies'),
  getEligible: ()       => apiFetch('/companies/eligible'),
  getById:     (id)     => apiFetch(`/companies/${id}`),
  create:      (b)      => apiFetch('/companies',       { method: 'POST',   body: JSON.stringify(b) }),
  update:      (id, b)  => apiFetch(`/companies/${id}`, { method: 'PUT',    body: JSON.stringify(b) }),
  delete:      (id)     => apiFetch(`/companies/${id}`, { method: 'DELETE' }),
};

// ── Applications ───────────────────────────────────────────────
const Applications = {
  getAll:       ()      => apiFetch('/applications'),
  apply:        (b)     => apiFetch('/applications',              { method: 'POST',   body: JSON.stringify(b) }),
  updateStatus: (id, b) => apiFetch(`/applications/${id}/status`, { method: 'PUT',    body: JSON.stringify(b) }),
  getAnalytics: ()      => apiFetch('/applications/analytics'),
  withdraw:     (id)    => apiFetch(`/applications/${id}`,        { method: 'DELETE' }),
};

// ── Sessions ───────────────────────────────────────────────────
const Sessions = {
  getAll:      ()       => apiFetch('/sessions'),
  getSelected: ()       => apiFetch('/sessions/selected'),
  getById:     (id)     => apiFetch(`/sessions/${id}`),
  create:      (b)      => apiFetch('/sessions',       { method: 'POST',   body: JSON.stringify(b) }),
  update:      (id, b)  => apiFetch(`/sessions/${id}`, { method: 'PUT',    body: JSON.stringify(b) }),
  delete:      (id)     => apiFetch(`/sessions/${id}`, { method: 'DELETE' }),
  select:      (id)     => apiFetch(`/sessions/${id}/select`, { method: 'POST'   }),
  unselect:    (id)     => apiFetch(`/sessions/${id}/select`, { method: 'DELETE' }),
};

// ── UI Helpers ─────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div');
    el.id = 'toast-container';
    el.className = 'toast-container';
    document.body.appendChild(el);
    return el;
  })();

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span class="toast-msg">${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
}

function setLoading(btn, loading) {
  if (loading) {
    btn._origText = btn.innerHTML;
    btn.innerHTML = `<span class="loader"></span> Loading…`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn._origText || 'Submit';
    btn.disabled = false;
  }
}

function statusBadge(status) {
  const map = {
    Applied:     'badge-applied',
    Shortlisted: 'badge-shortlisted',
    Technical:   'badge-technical',
    HR:          'badge-hr',
    Selected:    'badge-selected',
    Rejected:    'badge-rejected',
  };
  return `<span class="badge ${map[status] || ''}">${status}</span>`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(lpa) {
  return `₹${Number(lpa).toFixed(1)} LPA`;
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Sidebar population ─────────────────────────────────────────
function populateSidebar() {
  const role = getRole() || 'Student';

  const nameEl   = document.getElementById('sidebar-user-name');
  const roleEl   = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-avatar');

  if (nameEl)   nameEl.textContent   = role === 'Admin' ? 'Admin' : 'Student';
  if (roleEl)   roleEl.textContent   = role;
  if (avatarEl) avatarEl.textContent = role === 'Admin' ? 'AD' : 'ST';
}
