import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RiskBadge } from '../components/RiskBadge';
import { api } from '../services/api';

const DEMO_ICONS = {
  'quinoa-bowl': 'rice_bowl',
  'berry-smoothie': 'blender',
  'grilled-salmon': 'set_meal',
  'avocado-toast': 'bakery_dining',
  'chickpea-salad': 'grass',
  'sweet-potato': 'local_fire_department',
};

const DEMO_PREVIEW = {
  'quinoa-bowl': 'LOWER_CONCERN',
  'berry-smoothie': 'LOWER_CONCERN',
  'grilled-salmon': 'LOWER_CONCERN',
  'avocado-toast': 'LOWER_CONCERN',
  'chickpea-salad': 'LOWER_CONCERN',
  'sweet-potato': 'LOWER_CONCERN',
};

export default function Dashboard({ profile, demoFoods, onAnalyzeDemo }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.getHistory().then(res => setHistory(res.history || [])).catch(console.error);
  }, []);

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
            {history.length > 0 ? history.slice(0,3).map((item, i) => (
              <div key={i} className="bg-surface-container rounded-3xl p-6 shadow-sm hover:shadow-soft transition-shadow flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 bg-surface-container-lowest rounded-full shadow-sm flex items-center justify-center p-2">
                  <span translate="no" className="material-symbols-outlined notranslate text-[36px] text-primary">{item.status === 'HIGH_RISK' ? 'ramen_dining' : item.status === 'CAUTION' ? 'cookie' : 'eco'}</span>
                </div>
                <div>
                  <h4 className="font-display text-xl text-on-surface">{item.name}</h4>
                  <p className="font-sans text-sm text-on-surface-variant mt-2">{item.detail}</p>
                </div>
                <div className="mt-auto pt-4 flex flex-col items-center gap-2">
                  <RiskBadge status={item.status} />
                  <span className="text-xs text-outline">{item.time}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-1 md:col-span-3 bg-surface-container rounded-3xl p-8 text-center">
                <p className="font-sans text-on-surface-variant">No recent insights found. Analyze your first food!</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-12">
            <h3 className="font-display text-3xl text-on-surface">Try These Examples</h3>
            <div className="h-0.5 flex-1 bg-outline-variant/50 ml-4"></div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {demoFoods?.slice(0, 6).map(demo => (
              <div key={demo.id} className="bg-surface-container-high rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center hover:shadow-soft transition-shadow border border-outline-variant/30">
                 <div className="w-48 h-48 rounded-full overflow-hidden shadow-float shrink-0 border-4 border-white/40">
                   <img src={`/${demo.id}.jpg`} alt={demo.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                 </div>
                 <div className="space-y-4 flex-1 text-center md:text-left">
                   <h4 className="font-display text-3xl text-on-surface">{demo.name}</h4>
                   <p className="font-sans text-on-surface-variant text-lg">{demo.description}</p>
                   <div className="flex flex-col md:flex-row items-center gap-6 pt-2">
                     <button 
                        onClick={() => onAnalyzeDemo(demo.id)}
                        className="px-8 py-3 rounded-full bg-primary text-white font-bold text-lg hover:scale-[1.02] transition-transform shadow-soft w-full md:w-auto"
                      >
                       {t('dashboard.analyzeBtn')}
                     </button>
                     <RiskBadge status={DEMO_PREVIEW[demo.id] || 'VERIFY'} />
                   </div>
                 </div>
              </div>
            ))}
          </div>

        </section>

        {/* Right Col: Active Profile Stats */}
        <section className="relative h-full">

          {/* Sticky Content Box */}
          <div className="sticky top-8 space-y-6 z-10">
            <div className="bg-surface-container/95 rounded-3xl p-8 shadow-soft border border-white/40">
              <h3 className="font-display text-2xl text-on-surface mb-6">{t('dashboard.profile')}</h3>
              
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
                  <span className="font-bold text-primary">{history.length}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/profile')} 
                className="w-full mt-6 py-3 rounded-2xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors bg-white/50"
              >
                {t('dashboard.updatePrefs')}
              </button>
            </div>
            
            <div className="bg-[#E8F0DF]/95 rounded-3xl p-6 border border-[#7BA543]/30 shadow-soft">
              <div className="flex items-start gap-4">
                <span translate="no" className="material-symbols-outlined notranslate text-[#7BA543] text-[32px]">spa</span>
                <div>
                  <h4 className="font-display text-lg text-on-surface">{t('dashboard.didYouKnow')}</h4>
                  <p className="font-sans text-sm text-on-surface-variant mt-1">Our AI continuously learns from clinical databases to keep your safety guidelines completely up to date.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
