export function RiskBadge({ status, size = 'md' }) {
  const configs = {
    HIGH_RISK: {
      bg: 'bg-risk-high',
      text: 'text-white',
      icon: 'warning',
      label: 'High Risk'
    },
    CAUTION: {
      bg: 'bg-risk-caution',
      text: 'text-white',
      icon: 'notifications',
      label: 'Caution'
    },
    VERIFY: {
      bg: 'bg-risk-verify',
      text: 'text-[#4A2300]',
      icon: 'help',
      label: 'Verify'
    },
    LOWER_CONCERN: {
      bg: 'bg-risk-safe',
      text: 'text-white',
      icon: 'eco',
      label: 'Safe Choice'
    }
  };

  const c = configs[status] || configs.LOWER_CONCERN;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-[11px] gap-1',
    md: 'px-3 py-1.5 text-[13px] gap-1.5',
    lg: 'px-4 py-2 text-[15px] gap-2'
  };

  const iconSizes = { sm: '14px', md: '16px', lg: '20px' };

  return (
    <div className={`inline-flex items-center font-bold font-sans uppercase tracking-wide rounded-full shadow-sm ${c.bg} ${c.text} ${sizeClasses[size]}`}>
      <span className="material-symbols-outlined" style={{ fontSize: iconSizes[size], fontVariationSettings: "'FILL' 1" }}>
        {c.icon}
      </span>
      <span>{c.label}</span>
    </div>
  );
}

export function ConfidenceBar({ label, level }) {
  const levels = {
    HIGH: { color: 'bg-risk-safe', width: 'w-full' },
    MEDIUM: { color: 'bg-risk-verify', width: 'w-2/3' },
    LOW: { color: 'bg-risk-caution', width: 'w-1/3' },
  };
  const c = levels[level] || levels.LOW;

  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container border border-outline-variant">
      <span className="text-[14px] font-sans text-on-surface font-semibold">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-bold text-on-surface-variant">{level}</span>
        <div className="w-24 h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div className={`h-full rounded-full ${c.color} ${c.width}`}></div>
        </div>
      </div>
    </div>
  );
}
