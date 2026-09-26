import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import BarcodeScanner from '../components/BarcodeScanner';

export default function Compare({ profile, demoFoods }) {
  const [foodA, setFoodA] = useState({ name: '', ingredients: '' });
  const [foodB, setFoodB] = useState({ name: '', ingredients: '' });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [barcodeA, setBarcodeA] = useState('');
  const [barcodeB, setBarcodeB] = useState('');
  const [lookingUpA, setLookingUpA] = useState(false);
  const [lookingUpB, setLookingUpB] = useState(false);
  const [scanningA, setScanningA] = useState(false);
  const [scanningB, setScanningB] = useState(false);

  async function handleBarcodeLookup(barcode, setFood, setLookingUp) {
    if (!barcode.trim()) return;
    setLookingUp(true);
    setError(null);
    try {
      const data = await api.lookupBarcode(barcode);
      setFood(prev => ({
        ...prev,
        name: data.name || prev.name,
        ingredients: data.ingredients || prev.ingredients,
        nutrition: data.nutrition || prev.nutrition || {}
      }));
    } catch (e) {
      setError(e.message || 'Failed to find product by barcode.');
    }
    setLookingUp(false);
  }

  function loadDemo(foodSetter, id) {
    if(!id) return;
    const match = demoFoods.find(f => f.id === id);
    if(match) {
      api.getDemoFood(match.id).then(full => {
        foodSetter({ name: full.name, ingredients: full.ingredients, nutrition: full.nutrition });
      });
    }
  }

  async function handleCompare() {
    if (!foodA.name || !foodB.name) {
       setError("Please enter names for both products.");
       return;
    }
    if (!foodA.ingredients && !foodB.ingredients) {
       setError("Please enter ingredients for the products.");
       return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.compare(foodA, foodB, profile);
      setResult(res);
      setChatHistory([
        { role: 'assistant', text: `I've compared ${foodA.name} and ${foodB.name}. Based on your profile, here are the findings. Feel free to ask me questions!` }
      ]);
    } catch(e) {
      setError(e.message || "Comparison failed");
    }
    setLoading(false);
  }

  async function handleChatSubmit(e) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !result) return;

    const q = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    setChatLoading(true);

    try {
      const res = await api.compareChat(q, result.resultA, result.resultB, result.foodA.name, result.foodB.name, profile);
      setChatHistory(prev => [...prev, { role: 'assistant', text: res.answer }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error answering your question.' }]);
    }
    setChatLoading(false);
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const renderProductInput = (title, food, setFood, barcode, setBarcode, lookingUp, setLookingUp, setScanning) => (
    <div className="bg-white p-6 rounded-3xl shadow-soft border border-outline-variant/30 flex-1">
      <h2 className="text-xl font-display font-bold text-on-surface mb-4">{title}</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-bold text-on-surface-variant mb-2">Quick Select Demo Food</label>
        <select 
          className="w-full bg-surface p-3 rounded-2xl border border-outline-variant text-on-surface outline-none focus:border-primary transition-colors"
          onChange={e => loadDemo(setFood, e.target.value)}
        >
          <option value="">-- Custom Entry --</option>
          {demoFoods.map(df => <option key={df.id} value={df.id}>{df.name}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold text-on-surface-variant mb-2">Lookup via Barcode</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            placeholder="Enter barcode..."
            className="flex-1 bg-surface p-3 rounded-2xl border border-outline-variant text-on-surface outline-none focus:border-primary transition-colors text-sm"
          />
          <button
            onClick={() => handleBarcodeLookup(barcode, setFood, setLookingUp)}
            disabled={lookingUp || !barcode.trim()}
            className="px-4 py-2 rounded-2xl bg-primary text-white font-bold hover:brightness-110 disabled:opacity-50 shrink-0 text-sm"
          >
            {lookingUp ? '...' : 'Search'}
          </button>
          <button
            onClick={() => setScanning(true)}
            className="px-3 py-2 rounded-2xl bg-surface-container-high border border-outline-variant text-primary hover:bg-surface-container-highest transition-colors flex items-center justify-center shrink-0"
            title="Scan Barcode with Camera"
          >
            <span translate="no" className="material-symbols-outlined notranslate text-lg">barcode_scanner</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-on-surface-variant mb-2">Product Name</label>
          <input
            type="text"
            value={food.name}
            onChange={e => setFood({ ...food, name: e.target.value })}
            className="w-full bg-surface p-3 rounded-2xl border border-outline-variant text-on-surface outline-none focus:border-primary transition-colors"
            placeholder="e.g. Tomato Soup"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-on-surface-variant mb-2">Ingredients</label>
          <textarea
            value={food.ingredients}
            onChange={e => setFood({ ...food, ingredients: e.target.value })}
            rows={4}
            className="w-full bg-surface p-3 rounded-2xl border border-outline-variant text-on-surface outline-none focus:border-primary transition-colors resize-none"
            placeholder="Paste ingredients list here..."
          />
        </div>
      </div>
    </div>
  );

  const renderComparisonColumn = (foodName, res, isWinner, isTie) => {
    const findings = [
      ...res.allergenFindings.map(f => ({ ...f, type: 'allergen' })),
      ...res.ingredientFindings.map(f => ({ ...f, type: 'ingredient' })),
      ...res.nutritionFindings.map(f => ({ ...f, type: 'nutrition' }))
    ];
    
    return (
      <div className={`bg-white p-6 rounded-3xl shadow-soft border flex-1 relative ${isWinner ? 'border-primary shadow-primary/20 shadow-xl' : 'border-outline-variant/30'}`}>
        {isWinner && !isTie && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full font-bold text-sm shadow-md flex items-center gap-1">
            <span translate="no" className="material-symbols-outlined notranslate text-[16px]">stars</span>
            Better Choice
          </div>
        )}
        {isTie && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-surface-container-high text-on-surface px-4 py-1 rounded-full font-bold text-sm shadow-md flex items-center gap-1 border border-outline-variant">
            <span translate="no" className="material-symbols-outlined notranslate text-[16px]">balance</span>
            Similar Risk
          </div>
        )}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-outline-variant/30 mt-2">
          <h2 className="text-xl font-display font-bold text-on-surface">{foodName}</h2>
          <RiskBadge status={res.overallStatus} />
        </div>
        
        {findings.length > 0 ? (
          <div className="space-y-4">
            {findings.map((f, i) => (
              <div key={i} className="flex gap-3 bg-surface p-3 rounded-2xl">
                <RiskBadge status={f.status} size="sm" />
                <div>
                  <p className="font-bold text-[15px] text-on-surface">{f.matchedIngredient || f.ingredient || f.nutrient}</p>
                  <p className="text-[13px] text-on-surface-variant leading-snug">{f.reason || `Relevant to ${f.conditionName || f.relevantProfileFactor}`}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <span translate="no" className="material-symbols-outlined notranslate text-4xl text-outline mb-2">check_circle</span>
            <p className="text-on-surface-variant font-medium">No relevant concerns identified for this profile.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative z-10">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-display font-bold text-on-surface mb-3 tracking-tight">Food Comparison</h1>
        <p className="text-lg text-on-surface-variant">See which product aligns better with your personalized health profile.</p>
      </div>

      {!result && (
        <div className="space-y-8">
          <div className="flex gap-6 flex-col md:flex-row">
            {renderProductInput("Product A", foodA, setFoodA, barcodeA, setBarcodeA, lookingUpA, setLookingUpA, setScanningA)}
            <div className="hidden md:flex items-center justify-center -mx-3 z-10 text-outline">
              <span translate="no" className="material-symbols-outlined notranslate text-4xl bg-background rounded-full p-2">compare_arrows</span>
            </div>
            {renderProductInput("Product B", foodB, setFoodB, barcodeB, setBarcodeB, lookingUpB, setLookingUpB, setScanningB)}
          </div>
          
          {error && <p className="text-error text-center font-bold bg-error-container/50 py-3 rounded-2xl">{error}</p>}

          <div className="flex justify-center">
            <button 
              onClick={handleCompare}
              disabled={loading}
              className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold text-lg shadow-soft hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <span translate="no" className="material-symbols-outlined notranslate animate-spin">refresh</span>
              ) : (
                <span translate="no" className="material-symbols-outlined notranslate">analytics</span>
              )}
              {loading ? 'Analyzing...' : 'Compare Foods'}
            </button>
          </div>
        </div>
      )}

      {scanningA && (
        <BarcodeScanner 
          onClose={() => setScanningA(false)} 
          onScan={(text) => { setBarcodeA(text); setScanningA(false); handleBarcodeLookup(text, setFoodA, setLookingUpA); }} 
        />
      )}
      {scanningB && (
        <BarcodeScanner 
          onClose={() => setScanningB(false)} 
          onScan={(text) => { setBarcodeB(text); setScanningB(false); handleBarcodeLookup(text, setFoodB, setLookingUpB); }} 
        />
      )}

      {result && (
        <div className="space-y-8 animate-slide-up">
          <div className="flex justify-between items-center bg-white p-4 rounded-full shadow-soft border border-outline-variant/30">
             <button onClick={() => setResult(null)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold px-4 py-2 rounded-full hover:bg-surface transition-colors">
               <span translate="no" className="material-symbols-outlined notranslate">arrow_back</span>
               New Comparison
             </button>
          </div>

          <div className="bg-primary-container text-on-primary-container p-8 rounded-3xl shadow-soft">
            <div className="flex gap-4 items-start">
              <span translate="no" className="material-symbols-outlined notranslate text-3xl shrink-0 mt-1">psychology</span>
              <div>
                <h3 className="font-display font-bold text-xl mb-3">AI Comparison Summary</h3>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{result.explanation}</p>
              </div>
            </div>
          </div>

          {(() => {
            const priority = { 'HIGH_RISK': 4, 'CAUTION': 3, 'VERIFY': 2, 'LOWER_CONCERN': 1 };
            const pA = priority[result.resultA.overallStatus] || 1;
            const pB = priority[result.resultB.overallStatus] || 1;
            
            let winner = 'TIE';
            if (pA < pB) winner = 'A';
            else if (pB < pA) winner = 'B';
            else {
              const fA = result.resultA.allFindings?.length || 0;
              const fB = result.resultB.allFindings?.length || 0;
              if (fA < fB) winner = 'A';
              else if (fB < fA) winner = 'B';
            }

            return (
              <div className="flex flex-col md:flex-row gap-6 mt-8">
                {renderComparisonColumn(result.foodA.name, result.resultA, winner === 'A', winner === 'TIE')}
                {renderComparisonColumn(result.foodB.name, result.resultB, winner === 'B', winner === 'TIE')}
              </div>
            );
          })()}
          
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-outline-variant/30 text-sm text-on-surface-variant text-center mt-8">
             <p><strong>Limitations:</strong> Analysis is based on information available. This is not medical advice. Consider verifying ambiguous ingredients.</p>
          </div>

          {/* Chatbot */}
          <div className="bg-white rounded-3xl shadow-soft border border-outline-variant/30 overflow-hidden flex flex-col h-[400px]">
             <div className="bg-surface px-6 py-4 border-b border-outline-variant/30 flex items-center gap-3">
                <span translate="no" className="material-symbols-outlined notranslate text-primary">chat_bubble</span>
                <h3 className="font-display font-bold text-lg">Ask about this comparison</h3>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface text-on-surface rounded-bl-sm'}`}>
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-surface text-on-surface-variant p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                      <span translate="no" className="material-symbols-outlined notranslate animate-spin text-lg">refresh</span>
                      <span className="text-[14px]">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
             </div>

             <form onSubmit={handleChatSubmit} className="p-4 border-t border-outline-variant/30 bg-surface flex gap-3">
               <input 
                 type="text" 
                 value={chatInput} 
                 onChange={e => setChatInput(e.target.value)}
                 placeholder="e.g., Why did Product A get a CAUTION?"
                 className="flex-1 bg-white border border-outline-variant rounded-full px-5 py-3 outline-none focus:border-primary transition-colors text-[15px]"
               />
               <button 
                 type="submit" 
                 disabled={!chatInput.trim() || chatLoading}
                 className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-50 hover:brightness-110 transition-all"
               >
                 <span translate="no" className="material-symbols-outlined notranslate">send</span>
               </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
