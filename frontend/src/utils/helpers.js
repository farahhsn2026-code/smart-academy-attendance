export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Present': return 'badge-present';
    case 'Absent': return 'badge-absent';
    case 'Late': return 'badge-late';
    case 'Active': return 'badge-active';
    case 'Inactive': return 'badge-inactive';
    case 'Suspended': return 'badge-suspended';
    default: return 'badge-inactive';
  }
};

export const getDayName = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const truncate = (str, n) => {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '...' : str;
};
