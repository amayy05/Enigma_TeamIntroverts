import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/analyze', label: 'Analyze Food', icon: 'nutrition' },
  { to: '/profile', label: 'My Profile', icon: 'person' },
];

export default function Sidebar({ profile }) {
  const navigate = useNavigate();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col justify-between bg-surface-container-low border-r border-outline-variant z-40">
      <div className="h-full flex flex-col justify-between p-4">
        {/* Top: Brand + Nav */}
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <div>
              <div className="font-display text-lg font-bold text-primary tracking-tight leading-snug">NutriShield</div>
              <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">Health Intelligence</div>
            </div>
          </div>

          {/* Scan CTA */}
          <button
            onClick={() => navigate('/analyze')}
            className="w-full py-2.5 px-4 rounded-xl bg-primary-container hover:brightness-110 text-on-primary font-display font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[19px]">document_scanner</span>
            <span>Scan Ingredient</span>
          </button>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.99] ${
                    isActive
                      ? 'bg-surface-container-high text-primary font-semibold border-l-4 border-primary'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                    <span className="text-sm">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom: Settings + User */}
        <div className="space-y-4 pt-4 border-t border-outline-variant">
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">settings</span>
              <span className="text-sm">Settings</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">help</span>
              <span className="text-sm">Support</span>
            </a>
          </nav>

          {/* User Pill */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container border border-outline-variant">
            <div className="relative w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary font-bold text-sm">
              <span className="text-on-surface font-bold">{(profile?.name || 'U')[0]}</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary-container ring-2 ring-surface-container"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">{profile?.name || 'User'}</p>
              <p className="text-[10px] font-mono text-primary truncate">Active Protection</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
