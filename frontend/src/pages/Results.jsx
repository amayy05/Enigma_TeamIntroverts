import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { RiskBadge, ConfidenceBar } from '../components/RiskBadge';

const CATEGORY_LABELS = {
  allergens: { icon: 'warning', label: 'Allergens' },
  blood_sugar: { icon: 'water_drop', label: 'Blood Sugar' },
  sodium: { icon: 'bloodtype', label: 'Sodium levels' },
  kidney_related: { icon: 'monitor_heart', label: 'Kidney Impact' },
  dietary_restrictions: { icon: 'restaurant', label: 'Dietary' },
};

export default function Results({ analysisResult, profile }) {
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: "Hello! I'm your food intelligence assistant. I can explain these findings or suggest wholesome alternatives." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  if (!analysisResult) {
    return (
      <main className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <span className="material-symbols-outlined text-[80px] text-primary/30">search</span>
        <h2 className="font-display text-3xl text-on-surface">Nothing to show yet</h2>
        <p className="font-sans text-lg text-on-surface-variant">Head over to the analyzer to scan a new food label.</p>
        <button onClick={() => navigate('/analyze')} className="px-8 py-3 mt-4 rounded-full bg-primary text-white font-bold text-lg hover:scale-105 transition-transform shadow-soft">
          Start Scanning
        </button>
      </main>
    );
  }

  const { food, result, explanation } = analysisResult;
  const { overallStatus, breakdown, allergenFindings, ingredientFindings, nutritionFindings, nutritionSummary, limitations, confidence } = result;

  async function handleChat() {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim();
    setChatInput('');
    setChatHistory(h => [...h, { role: 'user', text: q }]);
    setChatLoading(true);
    try {
      const res = await api.chat(q, result, food?.name, profile);
      setChatHistory(h => [...h, { role: 'assistant', text: res.answer }]);
    } catch {
      setChatHistory(h => [...h, { role: 'assistant', text: 'I am currently offline. Please ensure my AI engine is running.' }]);
    }
    setChatLoading(false);
  }

  const QUICK_QUESTIONS = ['Why is this flagged?', 'Safe alternatives?', 'Is this okay for kids?'];

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/analyze')} className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <h1 className="font-display text-4xl text-on-surface">Insight Report</h1>
      </div>

      {/* Hero Banner */}
      <section className="bg-surface-container rounded-3xl p-8 relative overflow-hidden shadow-soft">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{
          background: overallStatus === 'HIGH_RISK' ? '#D9433B' : overallStatus === 'CAUTION' ? '#E89124' : '#7BA543'
        }}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b border-outline-variant/30 pb-6 mb-6">
          <div>
            <div className="font-sans text-on-surface-variant uppercase tracking-widest text-sm mb-2">Food Analyzed</div>
            <h2 className="font-display text-3xl font-bold text-on-surface">{food?.name || 'Unknown Food'}</h2>
          </div>
          <RiskBadge status={overallStatus} size="lg" />
        </div>

        {explanation && (
          <p className="relative z-10 font-sans text-xl text-on-surface leading-relaxed max-w-3xl">
            {explanation}
          </p>
        )}
      </section>

      {/* Breakdowns & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-8">
          {/* Breakdown */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/30">
             <h3 className="font-display text-2xl text-on-surface mb-6">Category Breakdown</h3>
             <div className="space-y-4">
              {Object.entries(breakdown || {}).map(([key, cat]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-outline-variant/30 last:border-0">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary">{CATEGORY_LABELS[key]?.icon || 'info'}</span>
                    <span className="font-sans font-bold">{CATEGORY_LABELS[key]?.label || key}</span>
                  </div>
                  <RiskBadge status={cat.status} />
                </div>
              ))}
             </div>
          </section>

          {/* Details */}
          {(allergenFindings?.length > 0 || ingredientFindings?.length > 0 || nutritionFindings?.length > 0) && (
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/30 space-y-4">
              <h3 className="font-display text-2xl text-on-surface">Specific Flags</h3>
              
              {allergenFindings?.map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-risk-high/10 border border-risk-high/20">
                  <div className="font-bold text-risk-high mb-1">{f.matchedIngredient} (Allergen)</div>
                  <div className="text-sm font-sans text-on-surface-variant">Direct match for your {f.allergenName} rule.</div>
                </div>
              ))}
              
              {ingredientFindings?.map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-on-surface">{f.ingredient}</div>
                    <RiskBadge status={f.status} size="sm" />
                  </div>
                  <p className="text-sm font-sans text-on-surface-variant">{f.reason}</p>
                </div>
              ))}
              
              {nutritionFindings?.map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-on-surface">{f.nutrient} Issue</div>
                    <RiskBadge status={f.status} size="sm" />
                  </div>
                  <p className="text-sm font-sans text-on-surface-variant">{f.reason}</p>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Chatbot */}
        <section className="bg-primary-container/10 rounded-3xl p-8 border border-primary-container/30 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary text-[28px]">eco</span>
            <h3 className="font-display text-2xl text-on-surface">Ask NutriShield AI</h3>
          </div>

          <div className="flex-1 space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3 rounded-2xl font-sans text-[15px] ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-none shadow-soft'
                    : 'bg-white text-on-surface rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
               <div className="flex justify-start">
                  <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></span>
                     <span className="w-2 h-2 rounded-full bg-primary/70 animate-pulse delay-75"></span>
                     <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></span>
                  </div>
               </div>
            )}
          </div>

          <div className="space-y-4 mt-auto">
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => setChatInput(q)} className="px-4 py-1.5 rounded-full bg-white text-primary text-sm font-bold shadow-sm hover:shadow-soft transition-shadow">
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                placeholder="Ask about these ingredients..."
                className="flex-1 bg-white border border-outline-variant rounded-full px-6 py-3 font-sans text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
              />
              <button
                onClick={handleChat}
                disabled={!chatInput.trim() || chatLoading}
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 shadow-soft transition-transform disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
