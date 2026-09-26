import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import BarcodeScanner from '../components/BarcodeScanner';

const NUTRITION_FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'carbohydrates', label: 'Total Carbs', unit: 'g' },
  { key: 'added_sugar', label: 'Added Sugar', unit: 'g' },
  { key: 'total_sugar', label: 'Total Sugar', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg' },
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
  const [extracting, setExtracting] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

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
    if (!ingredients.trim() && !foodName.trim()) { setError('Please enter a Food Name or ingredients.'); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await api.analyze({ name: foodName || 'Unnamed Food', ingredients, nutrition: showNutrition ? nutrition : {} }, profile);
      onResult(result);
      navigate('/results');
    } catch (e) {
      setError(e.message || 'Analysis failed. Check your connection.');
    }
    setLoading(false);
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setExtracting(true);
    setError(null);
    try {
      const data = await api.extractLabel(file);
      if (data.ingredients) setIngredients(data.ingredients);
      if (data.nutrition) {
        setNutrition(data.nutrition);
        setShowNutrition(true);
      }
    } catch (e) {
      setError(e.message || 'Failed to extract label data.');
    }
    setExtracting(false);
    // Reset file input
    e.target.value = null;
  }

  async function handleBarcodeLookup() {
    if (!barcode.trim()) return;
    setLookingUp(true);
    setError(null);
    try {
      const data = await api.lookupBarcode(barcode);
      setFoodName(data.name || '');
      setIngredients(data.ingredients || '');
      setNutrition(data.nutrition || {});
      setShowNutrition(true);
    } catch (e) {
      setError(e.message || 'Failed to find product by barcode.');
    }
    setLookingUp(false);
  }

  return (
    <main className="p-8 max-w-5xl mx-auto">
      
      <div className="text-center space-y-4 mb-12">
        <h1 className="font-display text-5xl text-on-surface">Analyze Your Food</h1>
        <p className="font-sans text-lg text-on-surface-variant max-w-2xl mx-auto">
          Paste the ingredients from any label and discover how it impacts your body.
        </p>
      </div>

      <div className="bg-surface-container rounded-3xl p-8 shadow-sm border border-outline-variant/30 space-y-8 relative overflow-hidden">
        {/* Soft yellow glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD54F]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <label className="block font-display text-xl text-on-surface mb-2">What are we looking at?</label>
          <input
            type="text"
            value={foodName}
            onChange={e => setFoodName(e.target.value)}
            placeholder="e.g. Grandma's Sugar Cookies"
            className="w-full bg-white border border-outline-variant rounded-2xl px-6 py-4 font-sans text-lg text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-high rounded-2xl p-6 border border-outline-variant">
          <div>
            <h3 className="font-display text-xl text-on-surface">Got a photo of the label?</h3>
            <p className="font-sans text-on-surface-variant">Upload it and our AI will extract the ingredients and nutrition facts automatically.</p>
          </div>
          <label className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-outline-variant text-primary font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer shadow-sm">
            <span translate="no" className="material-symbols-outlined notranslate">{extracting ? 'refresh' : 'add_a_photo'}</span>
            <span>{extracting ? 'Extracting...' : 'Upload Image'}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={extracting} className="hidden" />
          </label>
        </div>

        <div className="relative z-10 bg-surface-container-high rounded-2xl p-6 border border-outline-variant">
          <h3 className="font-display text-xl text-on-surface mb-1">Have a Barcode?</h3>
          <p className="font-sans text-sm text-on-surface-variant mb-4">Lookup the product in the global Open Food Facts database.</p>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              placeholder="Enter barcode number..."
              className="flex-1 bg-white border border-outline-variant rounded-xl px-4 py-3 font-sans text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleBarcodeLookup}
              disabled={lookingUp || !barcode.trim()}
              className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 shrink-0"
            >
              {lookingUp ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => setScanning(true)}
              className="px-4 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold hover:brightness-105 transition-colors flex items-center gap-2 shrink-0 border border-primary/20"
              title="Scan Barcode with Camera"
            >
              <span translate="no" className="material-symbols-outlined notranslate">barcode_scanner</span>
              <span>Scan with Camera</span>
            </button>
          </div>
        </div>

        <div className="relative z-10">
          <label className="block font-display text-xl text-on-surface mb-2">
            The Ingredients <span className="text-risk-high">*</span>
          </label>
          <textarea
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            rows={5}
            placeholder="Paste the ingredient list here... (e.g., Whole wheat, honey, natural flavors)"
            className="w-full bg-white border border-outline-variant rounded-2xl px-6 py-4 font-sans text-lg text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="relative z-10 bg-white rounded-2xl p-6 border border-outline-variant">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display text-xl text-on-surface">Nutrition Facts (Optional)</span>
            <button onClick={() => setShowNutrition(!showNutrition)} className="text-primary font-bold hover:underline">
              {showNutrition ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showNutrition && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {NUTRITION_FIELDS.map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="block font-sans text-sm text-on-surface-variant mb-1">{label} ({unit})</label>
                  <input
                    type="number"
                    min="0"
                    value={nutrition[key] ?? ''}
                    onChange={e => setNutritionField(key, e.target.value)}
                    placeholder="0"
                    className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2 font-sans text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="relative z-10 p-4 rounded-xl bg-risk-high/10 text-risk-high font-bold text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || (!ingredients.trim() && !foodName.trim())}
          className="relative z-10 w-full py-4 rounded-full bg-primary text-white font-bold text-lg hover:scale-[1.02] transition-transform shadow-float disabled:opacity-50"
        >
          {loading ? (ingredients.trim() ? 'Checking with our database...' : 'Inferring ingredients...') : 'Reveal Insights'}
        </button>
      </div>

      {scanning && (
        <BarcodeScanner 
          onClose={() => setScanning(false)} 
          onScan={(text) => { 
            setBarcode(text); 
            setScanning(false); 
            // We can't directly call handleBarcodeLookup here because it uses state 'barcode', 
            // so we do it inline with the new text.
            setLookingUp(true);
            api.lookupBarcode(text).then(data => {
              setFoodName(data.name || '');
              setIngredients(data.ingredients || '');
              setNutrition(data.nutrition || {});
              setShowNutrition(true);
              setLookingUp(false);
            }).catch(e => {
              setError(e.message || 'Failed to find product by barcode.');
              setLookingUp(false);
            });
          }} 
        />
      )}

    </main>
  );
}
