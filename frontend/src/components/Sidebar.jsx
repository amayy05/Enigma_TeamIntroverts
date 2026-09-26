import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/analyze', label: 'Analyze Food', icon: 'search' },
  { to: '/profile', label: 'My Health', icon: 'favorite' },
];

export default function Sidebar({ profile }) {
  const navigate = useNavigate();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col justify-between bg-surface border-r border-outline-variant z-40">
      <div className="h-full flex flex-col justify-between p-6">
        {/* Top: Brand + Nav */}
        <div className="space-y-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-on-surface tracking-tight">NutriShield</div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-2">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-on-primary font-bold shadow-soft'
                      : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="material-symbols-outlined text-[22px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                    <span className="text-[15px]">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom: User */}
        <div className="space-y-4 pt-6 border-t border-outline-variant">
          <button
            onClick={() => navigate('/analyze')}
            className="w-full py-3.5 px-4 rounded-full bg-primary-container hover:brightness-110 text-on-primary-container font-sans font-bold text-[15px] flex items-center justify-center gap-2 shadow-soft transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
            <span>Scan Label</span>
          </button>
          
          {/* User Pill */}
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary-container flex items-center justify-center text-primary font-bold text-lg">
              {(profile?.name || 'U')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-on-surface truncate">{profile?.name || 'User'}</p>
              <p className="text-[12px] font-sans text-on-surface-variant truncate">Health Profile Active</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
