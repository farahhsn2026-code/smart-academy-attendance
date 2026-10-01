const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-600',
    iconBg: 'bg-blue-600 text-white'
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-600',
    iconBg: 'bg-emerald-600 text-white'
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    text: 'text-rose-600',
    iconBg: 'bg-rose-600 text-white'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-600',
    iconBg: 'bg-amber-500 text-white'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    text: 'text-indigo-600',
    iconBg: 'bg-indigo-600 text-white'
  }
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const styles = colorMap[color] || colorMap.blue;

  return (
    <div className="card p-6 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {value !== undefined ? value : 0}
        </p>
        {subtitle && (
          <p className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </div>

      {Icon && (
        <div className={`p-3 rounded-2xl ${styles.iconBg} shadow-sm shadow-black/5`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
