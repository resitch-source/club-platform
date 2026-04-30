// ===== CLUBOS AUTH =====
const ClubAuth = (() => {
  const KEY = CONFIG.SESSION_KEY;

  function getUser() {
    try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; }
  }

  function setUser(user) {
    sessionStorage.setItem(KEY, JSON.stringify(user));
  }

  function logout() {
    sessionStorage.removeItem(KEY);
    window.location.href = '../index.html';
  }

  function requireAuth(allowedRoles) {
    const user = getUser();
    if (!user) {
      window.location.href = '../index.html';
      return null;
    }
    if (allowedRoles && !allowedRoles.includes(user.role) && !allowedRoles.includes(user.portal)) {
      window.location.href = '../index.html';
      return null;
    }
    return user;
  }

  function getUserInitials(user) {
    if (!user) return '?';
    const n = user.name || user.email || '';
    const parts = n.split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : n.slice(0,2).toUpperCase();
  }

  return { getUser, setUser, logout, requireAuth, getUserInitials };
})();