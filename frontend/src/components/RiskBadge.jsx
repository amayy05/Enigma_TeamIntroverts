/**
 * Risk badge utility component — matches NutriShield design system
 * Status: HIGH_RISK | CAUTION | VERIFY | LOWER_CONCERN
 */
const BADGE_CONFIG = {
  HIGH_RISK: { label: 'HIGH RISK', bg: 'bg-red-600', text: 'text-white', glow: 'badge-high' },
  CAUTION: { label: 'CAUTION', bg: 'bg-amber-500', text: 'text-slate-900', glow: 'badge-caution' },
  VERIFY: { label: 'VERIFY', bg: 'bg-yellow-400', text: 'text-slate-900', glow: 'badge-verify' },
  LOWER_CONCERN: { label: 'LOWER CONCERN', bg: 'bg-emerald-500', text: 'text-white', glow: 'badge-safe' },
};

const STATUS_ICON = {
  HIGH_RISK: 'dangerous',
  CAUTION: 'warning',
  VERIFY: 'help',
  LOWER_CONCERN: 'check_circle',
};

export function RiskBadge({ status, size = 'md' }) {
  const cfg = BADGE_CONFIG[status] || BADGE_CONFIG.LOWER_CONCERN;
  const sizeClass = size === 'lg'
    ? 'px-4 py-1.5 text-sm font-bold'
    : 'px-2.5 py-0.5 text-[11px] font-semibold tracking-wide';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeClass} ${cfg.bg} ${cfg.text} ${cfg.glow}`}>
      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {STATUS_ICON[status] || 'info'}
      </span>
      {cfg.label}
    </span>
  );
}

export function RiskStatusIcon({ status }) {
  const cfg = BADGE_CONFIG[status] || BADGE_CONFIG.LOWER_CONCERN;
  const emoji = { HIGH_RISK: '🔴', CAUTION: '🟠', VERIFY: '🟡', LOWER_CONCERN: '🟢' };
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${cfg.text}`}>
      {emoji[status] || '⚪'} {cfg.label}
    </span>
  );
}

export function ConfidenceBar({ label, level }) {
  const pct = level === 'high' ? 95 : level === 'medium' ? 70 : 45;
  const color = level === 'high' ? 'bg-primary-container' : level === 'medium' ? 'bg-amber-500' : 'bg-error';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-body-sm font-body-sm text-on-surface-variant">{label}</span>
        <span className={`text-label-sm font-label-sm font-mono uppercase ${level === 'high' ? 'text-primary' : level === 'medium' ? 'text-amber-400' : 'text-error'}`}>{level?.toUpperCase()}</span>
      </div>
      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
