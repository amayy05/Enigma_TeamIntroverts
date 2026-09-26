import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
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

const NUTRITION_FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'carbohydrates', label: 'Total Carbs', unit: 'g' },
  { key: 'added_sugar', label: 'Added Sugar', unit: 'g' },
  { key: 'total_sugar', label: 'Total Sugar', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'fat', label: 'Total Fat', unit: 'g' },
];

export default function Analyzer({ profile, demoFoods, initialFoodId, onResult }) {
  const navigate = useNavigate();
  const [foodName, setFoodName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [showNutrition, setShowNutrition] = useState(true);
  const [nutrition, setNutrition] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial demo food if navigated from Dashboard
  useEffect(() => {
    if (initialFoodId) loadDemoFood(initialFoodId);
  }, [initialFoodId]);

  async function loadDemoFood(id) {
    try {
      const food = await api.getDemoFood(id);
      setFoodName(food.name);
      setIngredients(food.ingredients);
      setNutrition(food.nutrition || {});
      setShowNutrition(true);
    } catch {
      // If offline/no backend, load from demoFoods prop
      const food = demoFoods?.find(f => f.id === id);
      if (food) {
        setFoodName(food.name);
        setIngredients(food.ingredients || '');
      }
    }
  }

  function setNutritionField(key, val) {
    setNutrition(p => ({ ...p, [key]: val === '' ? undefined : parseFloat(val) }));
  }

  async function handleAnalyze() {
    if (!ingredients.trim()) { setError('Please enter ingredient information.'); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await api.analyze({ name: foodName || 'Unnamed Food', ingredients, nutrition: showNutrition ? nutrition : {} }, profile);
      onResult(result);
      navigate('/results');
    } catch (e) {
      setError(e.message || 'Analysis failed. Check that the backend is running.');
    }
    setLoading(false);
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface tracking-tight">Analyze Food</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant mt-1">
          Enter food information to get your personalized risk assessment.
        </p>
        {/* Active profile indicators */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(profile?.conditions || []).map(c => (
            <span key={c} className="px-2.5 py-0.5 rounded-full bg-primary-container/20 border border-primary-container/30 text-primary text-label-sm font-label-sm">{c}</span>
          ))}
          {(profile?.allergies || []).map(a => (
            <span key={a} className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-label-sm font-label-sm">{a.replace('_', ' ')}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-5">
            {/* Food Name */}
            <div>
              <label className="block text-body-sm font-body-sm text-on-surface-variant mb-1.5">Food Name</label>
              <input
                type="text"
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
                placeholder="e.g. Sugar-Free Biscuit"
                className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-body-sm font-body-sm text-on-surface-variant mb-1.5">
                Ingredients List <span className="text-error">*</span>
              </label>
              <textarea
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
                rows={6}
                placeholder="Paste or type ingredient list here...&#10;e.g. Wheat flour, maltodextrin, vegetable oil, milk solids, salt"
                className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-4 py-3 text-on-surface text-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
              />
              <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">Separate ingredients by commas. Paste directly from food label.</p>
            </div>

            {/* Nutrition Toggle */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-body-md font-body-md font-medium text-on-surface">Include Nutrition Information</span>
                <button
                  onClick={() => setShowNutrition(p => !p)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${showNutrition ? 'bg-primary-container' : 'bg-surface-container-highest'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${showNutrition ? 'translate-x-6' : 'translate-x-1'}`}></span>
                </button>
              </div>
              {showNutrition && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {NUTRITION_FIELDS.map(({ key, label, unit }) => (
                    <div key={key}>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">{label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={nutrition[key] ?? ''}
                          onChange={e => setNutritionField(key, e.target.value)}
                          placeholder="0"
                          className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 pr-10 text-on-surface text-body-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-all"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-label-sm font-label-sm text-on-surface-variant">{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 flex items-center gap-2 text-error text-body-sm">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !ingredients.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary-container text-on-primary font-bold text-sm hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-container/20"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                  Analyzing for your profile...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  Analyze for My Profile →
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Demo Foods */}
        <div className="space-y-4">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[16px]">science</span>
                <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Demo Foods</h3>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Try a pre-loaded example to see NutriShield in action.</p>
            </div>
            <div className="space-y-2">
              {(demoFoods || []).map(food => (
                <button
                  key={food.id}
                  onClick={() => loadDemoFood(food.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary hover:bg-surface-bright text-on-surface text-body-md transition-all text-left group"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-[16px]">
                      {DEMO_ICONS[food.id] || 'fastfood'}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{food.name}</div>
                      <div className="text-[10px] text-on-surface-variant font-mono">{food.description?.slice(0, 35)}...</div>
                    </div>
                  </span>
                  <RiskBadge status={DEMO_PREVIEW[food.id] || 'LOWER_CONCERN'} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
