import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Discover Wholesome Food',
  '/analyze': 'Analyze Ingredients',
  '/profile': 'Your Dietary Needs',
  '/results': 'Ingredient Insights',
};

export default function TopNav({ profile }) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'NutriShield';

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md px-8 py-5 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h2 className="text-headline-lg font-display text-on-surface leading-tight">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-64 hidden md:block">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            className="w-full bg-surface-container-high rounded-full pl-11 pr-4 py-2.5 text-body-md font-sans text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            placeholder="Search ingredients..."
            type="text"
          />
        </div>
        <button className="p-2.5 rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors active:scale-95">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
      </div>
    </header>
  );
}
