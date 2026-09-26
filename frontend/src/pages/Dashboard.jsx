import { useNavigate } from 'react-router-dom';
import { RiskBadge } from '../components/RiskBadge';

const DEMO_ICONS = {
  'sugar-free-biscuit': 'cookie',
  'instant-noodles': 'ramen_dining',
  'spice-mix': 'grain',
  'milk-chocolate': 'bakery_dining',
  'packaged-juice': 'local_drink',
  'protein-bar': 'fitness_center',
  'breakfast-cereal': 'breakfast_dining',
  'salad-dressing': 'salad',
};

const DEMO_PREVIEW = {
  'sugar-free-biscuit': 'CAUTION',
  'instant-noodles': 'HIGH_RISK',
  'spice-mix': 'VERIFY',
  'milk-chocolate': 'HIGH_RISK',
  'packaged-juice': 'CAUTION',
  'protein-bar': 'CAUTION',
  'breakfast-cereal': 'CAUTION',
  'salad-dressing': 'VERIFY',
};

const RECENT = [
  { name: 'Instant Ramen Noodles - Spicy Beef', status: 'HIGH_RISK', detail: 'Excessive Sodium (1,820mg) triggers Hypertension alert • MSG & Preservatives', time: '2 hours ago' },
  { name: 'Artisan Granola Bar - Almond Honey', status: 'CAUTION', detail: 'Added Sugars (18g) impact Diabetes profile • Made in facility processing peanuts', time: 'Yesterday 4:15 PM' },
  { name: 'Organic Steamed Edamame', status: 'LOWER_CONCERN', detail: 'Zero flagged allergens • Low glycemic index • Heart-healthy fiber', time: '3 days ago' },
];

export default function Dashboard({ profile, demoFoods, onAnalyzeDemo }) {
  const navigate = useNavigate();
  const conditions = profile?.conditions || [];
  const allergies = profile?.allergies || [];

  const conditionLabels = {
    diabetes: { label: 'Diabetes', icon: 'water_drop' },
    ckd: { label: 'CKD', icon: 'monitor_heart' },
    hypertension: { label: 'Hypertension', icon: 'cardiology' },
    pcos: { label: 'PCOS', icon: 'healing' },
  };
  const allergyLabels = {
    peanut_allergy: { label: 'Peanut Allergy', icon: 'warning' },
    milk_allergy: { label: 'Milk Allergy', icon: 'no_drinks' },
    soy_allergy: { label: 'Soy Allergy', icon: 'warning' },
    wheat_allergy: { label: 'Wheat Allergy', icon: 'grain' },
    tree_nut_allergy: { label: 'Tree Nut Allergy', icon: 'warning' },
  };

  const activeFilters = [
    ...conditions.map(c => conditionLabels[c]),
    ...allergies.map(a => allergyLabels[a]),
  ].filter(Boolean);

  return (
    <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
      {/* Welcome Row */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface tracking-tight">
            Good morning, {profile?.name || 'User'}
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant mt-1">Your food risk intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container border border-outline-variant text-body-sm font-body-sm text-on-surface">
            <span className="material-symbols-outlined text-primary text-[16px]">calendar_today</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </section>

      {/* Active Health Profile Card */}
      <section className="p-5 rounded-xl bg-surface-container border border-outline-variant shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">Active Health Profile</h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary border border-outline-variant text-label-sm font-label-sm">
                {activeFilters.length} ACTIVE RULES
              </span>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant">Your personalized dietary risk filters are currently active.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {activeFilters.length === 0 ? (
              <span className="text-body-sm text-on-surface-variant italic">No conditions set yet.</span>
            ) : (
              activeFilters.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary font-body-md text-body-md font-semibold shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))
            )}
            <button onClick={() => navigate('/profile')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-outline text-on-surface-variant hover:text-on-surface hover:border-primary text-body-sm font-body-sm transition-all duration-150">
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Condition</span>
            </button>
          </div>
        </div>
      </section>

      {/* Hero CTA */}
      <section className="relative rounded-xl border border-primary-container/30 p-6 md:p-8 bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-lowest overflow-hidden shadow-lg">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-highest border border-outline-variant text-label-sm font-label-sm text-primary">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>AI INGREDIENT INFERENCE ENGINE</span>
            </div>
            <h2 className="text-headline-md font-headline-md font-bold text-on-surface tracking-tight leading-snug">
              Scan or Enter Food Ingredients to Detect Hidden Hazards
            </h2>
            <p className="text-body-md font-body-md text-on-surface-variant">
              Instant multi-condition analysis comparing 4,000+ additives against your medical profile.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button onClick={() => navigate('/analyze')} className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary-container text-on-primary font-body-md text-body-md font-bold hover:brightness-110 shadow-md transition-all active:scale-[0.98]">
              <span>Analyze Food</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Foods Analyzed', value: '0', icon: 'nutrition', iconColor: 'text-primary', iconBg: 'bg-surface-container-high border-outline-variant', sub: 'Start by analyzing a food', trend: null },
          { label: 'Risks Detected', value: '0', icon: 'warning', iconColor: 'text-error', iconBg: 'bg-error-container/30 border-error/30', sub: 'No flags detected yet', valueColor: 'text-on-surface' },
          { label: 'All Clear', value: '0', icon: 'check_circle', iconColor: 'text-primary', iconBg: 'bg-surface-container-high border-outline-variant', sub: 'Safe results will appear here', valueColor: 'text-primary' },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-xl bg-surface-container border border-outline-variant flex flex-col justify-between hover:border-outline transition-colors">
            <div className="flex items-start justify-between">
              <span className="text-label-md font-label-md text-on-surface-variant tracking-wider uppercase">{s.label}</span>
              <div className={`p-2 rounded-lg border ${s.iconBg} ${s.iconColor}`}>
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-headline-lg font-headline-lg font-bold ${s.valueColor || 'text-on-surface'}`}>{s.value}</span>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">{s.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Recent + Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Analyses */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[16px]">receipt_long</span>
              <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Recent Analyses</h3>
            </div>
          </div>
          <div className="space-y-3">
            {RECENT.map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-container border border-outline-variant hover:border-outline transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <RiskBadge status={item.status} />
                    <h4 className="text-body-lg font-body-lg font-semibold text-on-surface">{item.name}</h4>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">{item.detail}</p>
                </div>
                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0">
                  <span className="text-label-sm font-label-sm text-outline">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Demo Foods */}
        <section className="space-y-4">
          <div className="p-5 rounded-xl bg-surface-container border border-outline-variant shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[16px]">science</span>
                <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Quick Demo Foods</h3>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Click to test the intelligence engine:</p>
            </div>
            <div className="flex flex-col gap-2">
              {(demoFoods || []).slice(0, 5).map((food) => (
                <button
                  key={food.id}
                  onClick={() => onAnalyzeDemo(food.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary hover:bg-surface-bright text-on-surface text-body-md font-body-md transition-all text-left group"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-[16px]">
                      {DEMO_ICONS[food.id] || 'fastfood'}
                    </span>
                    {food.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <RiskBadge status={DEMO_PREVIEW[food.id] || 'LOWER_CONCERN'} size="sm" />
                    <span className="text-label-sm font-label-sm text-on-surface-variant group-hover:text-primary">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            <div className="text-body-sm font-body-sm text-on-surface-variant">
              <span className="text-on-surface font-semibold">Active Monitoring:</span> Alerts evaluated against clinical database guidelines.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
