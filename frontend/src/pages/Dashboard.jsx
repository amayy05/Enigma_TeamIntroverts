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
  { name: 'Instant Ramen Noodles', status: 'HIGH_RISK', detail: 'High Sodium (1,820mg) • Hypertension alert', time: '2 hours ago' },
  { name: 'Artisan Granola Bar', status: 'CAUTION', detail: 'Added Sugars (18g) • Diabetes profile', time: 'Yesterday 4:15 PM' },
  { name: 'Organic Steamed Edamame', status: 'LOWER_CONCERN', detail: 'Zero flagged allergens • Heart-healthy', time: '3 days ago' },
];

export default function Dashboard({ profile, demoFoods, onAnalyzeDemo }) {
  const navigate = useNavigate();

  return (
    <main className="pb-12 max-w-7xl w-full mx-auto overflow-hidden">
      
      {/* Huge Hero Banner with generated food imagery */}
      <section className="relative w-full h-[400px] bg-gradient-to-br from-primary-container to-[#F4B969] torn-edge">
        <div className="absolute inset-0 flex items-center justify-between px-12 pb-10">
          <div className="max-w-xl text-white space-y-4">
            <h1 className="font-display text-[56px] leading-[1.1] text-on-primary">
              Nourish Your Body <br/>
              <span className="text-on-primary-container">Know Your Food.</span>
            </h1>
            <p className="font-sans text-lg text-on-primary/90">
              Personalized insights based on your health profile. We analyze the labels so you can enjoy every bite.
            </p>
            <button 
              onClick={() => navigate('/analyze')} 
              className="mt-4 px-8 py-4 rounded-full bg-surface text-primary font-bold text-lg shadow-float hover:scale-105 transition-transform"
            >
              Analyze Ingredients
            </button>
          </div>
          {/* Beautiful Food Image */}
          <div className="hidden lg:block relative w-[350px] h-[350px]">
            <img 
              src="/food_berries.jpg" 
              alt="Fresh berries" 
              className="absolute inset-0 w-full h-full object-cover rounded-full shadow-float border-4 border-white/20"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area (Below the torn edge) */}
      <div className="px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Recent + Demo Cards styled like the reference image */}
        <section className="lg:col-span-2 space-y-8">
          
          <div className="flex items-center gap-3">
            <h3 className="font-display text-3xl text-on-surface">Recent Insights</h3>
            <div className="h-0.5 flex-1 bg-outline-variant/50 ml-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RECENT.map((item, i) => (
              <div key={i} className="bg-surface-container rounded-3xl p-6 shadow-sm hover:shadow-soft transition-shadow flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 bg-surface-container-lowest rounded-full shadow-sm flex items-center justify-center p-2">
                  <span className="material-symbols-outlined text-[36px] text-primary">{item.status === 'HIGH_RISK' ? 'ramen_dining' : item.status === 'CAUTION' ? 'cookie' : 'eco'}</span>
                </div>
                <div>
                  <h4 className="font-display text-xl text-on-surface">{item.name}</h4>
                  <p className="font-sans text-sm text-on-surface-variant mt-2">{item.detail}</p>
                </div>
                <div className="mt-auto pt-4">
                  <RiskBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-12">
            <h3 className="font-display text-3xl text-on-surface">Try These Examples</h3>
            <div className="h-0.5 flex-1 bg-outline-variant/50 ml-4"></div>
          </div>

          <div className="bg-surface-container-high rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center">
             <div className="w-48 h-48 rounded-full overflow-hidden shadow-float shrink-0">
               <img src="/food_nuts.jpg" alt="Mixed nuts" className="w-full h-full object-cover" />
             </div>
             <div className="space-y-4">
               <h4 className="font-display text-2xl text-on-surface">Roasted Mixed Nuts</h4>
               <p className="font-sans text-on-surface-variant">A perfect snack, but how does it fit your specific dietary needs? Let's check for allergens and sodium levels.</p>
               <button 
                  onClick={() => onAnalyzeDemo('spice-mix')}
                  className="px-6 py-2.5 rounded-full bg-primary text-white font-bold hover:brightness-110 shadow-soft"
                >
                 Simulate Analysis
               </button>
             </div>
          </div>

        </section>

        {/* Right Col: Active Profile Stats */}
        <section className="space-y-6">
          <div className="bg-surface-container rounded-3xl p-8 shadow-sm">
            <h3 className="font-display text-2xl text-on-surface mb-6">Your Profile</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/50 pb-4">
                <span className="font-sans text-on-surface-variant">Conditions</span>
                <span className="font-bold text-primary">{profile?.conditions?.length || 0} Active</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/50 pb-4">
                <span className="font-sans text-on-surface-variant">Allergies</span>
                <span className="font-bold text-primary">{profile?.allergies?.length || 0} Listed</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="font-sans text-on-surface-variant">Foods Checked</span>
                <span className="font-bold text-primary">12 This Week</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/profile')} 
              className="w-full mt-6 py-3 rounded-2xl border-2 border-primary text-primary font-bold hover:bg-primary/10 transition-colors"
            >
              Update Preferences
            </button>
          </div>
          
          <div className="bg-secondary-container/20 rounded-3xl p-6 border border-secondary/30">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary text-[32px]">spa</span>
              <div>
                <h4 className="font-display text-lg text-on-surface">Did you know?</h4>
                <p className="font-sans text-sm text-on-surface-variant mt-1">Our AI continuously learns from clinical databases to keep your safety guidelines completely up to date.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
