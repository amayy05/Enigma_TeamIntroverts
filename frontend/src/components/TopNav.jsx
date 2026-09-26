import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/analyze': 'Analyze Food',
  '/profile': 'My Profile',
  '/results': 'Food Risk Report',
};

export default function TopNav({ profile }) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'NutriShield';

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant shadow-sm px-6 py-3.5 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-headline-md font-headline-md font-bold text-on-surface leading-tight">{title}</h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant">NutriShield Intelligent Dietary Safeguards</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant text-label-sm font-label-sm text-primary">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          <span>SYSTEM ACTIVE • PROFILE SYNCED</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-64 hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
          <input
            className="w-full bg-surface-container border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
            placeholder="Search additives, E-numbers..."
            type="text"
          />
        </div>
        <button className="relative p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors active:scale-95">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container"></span>
        </button>
        <button className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors active:scale-95">
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>
        <div className="pl-2 border-l border-outline-variant">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface font-bold text-sm">
            {(profile?.name || 'U')[0]}
          </div>
        </div>
      </div>
    </header>
  );
}
