import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { RiskBadge, ConfidenceBar } from '../components/RiskBadge';

const CATEGORY_LABELS = {
  allergens: { icon: 'warning', label: 'Allergens' },
  blood_sugar: { icon: 'water_drop', label: 'Blood Sugar / Glycemic' },
  sodium: { icon: 'bloodtype', label: 'Sodium / Blood Pressure' },
  kidney_related: { icon: 'monitor_heart', label: 'Kidney-Related' },
  dietary_restrictions: { icon: 'restaurant', label: 'Dietary Restrictions' },
};

export default function Results({ analysisResult, profile }) {
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Ask me anything about this food analysis. I can explain findings, suggest alternatives, or help you understand ingredient risks.' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  if (!analysisResult) {
    return (
      <main className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant">search</span>
        <h2 className="text-headline-sm font-headline-sm text-on-surface">No Analysis Yet</h2>
        <p className="text-body-md text-on-surface-variant">Go to Analyze Food to scan an ingredient list.</p>
        <button onClick={() => navigate('/analyze')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-bold text-sm hover:brightness-110 transition-all">
          <span className="material-symbols-outlined text-[18px]">nutrition</span>
          Analyze Food
        </button>
      </main>
    );
  }

  const { food, result, explanation } = analysisResult;
  const { overallStatus, breakdown, allergenFindings, ingredientFindings, nutritionFindings, nutritionSummary, limitations, confidence } = result;

  const profileContext = [
    ...(profile?.conditions || []),
    ...(profile?.allergies || []).map(a => a.replace('_', ' ')),
  ].join(', ') || 'No profile set';

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
      setChatHistory(h => [...h, { role: 'assistant', text: 'NutriShield AI is currently unavailable. Please check if the backend is running with a GEMINI_API_KEY.' }]);
    }
    setChatLoading(false);
  }

  const QUICK_QUESTIONS = ['Why is this flagged?', 'Safe alternatives?', 'How much can I eat?'];

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/analyze')} className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors text-body-sm">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Analyze Food
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 font-mono">
            Personalized Food Risk Report • {new Date().toLocaleDateString()}
          </div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface tracking-tight">
            {food?.name || 'Food Analysis'}
          </h1>
        </div>
      </div>

      {/* Hero Status Banner */}
      <section className={`relative rounded-xl p-6 border overflow-hidden ${
        overallStatus === 'HIGH_RISK' ? 'border-red-500/40 bg-red-500/5' :
        overallStatus === 'CAUTION' ? 'border-amber-500/40 bg-amber-500/5' :
        overallStatus === 'VERIFY' ? 'border-yellow-400/40 bg-yellow-400/5' :
        'border-emerald-500/40 bg-emerald-500/5'
      }`}>
        <div className="absolute -right-12 -top-12 w-48 h-48 opacity-10 rounded-full blur-3xl" style={{
          background: overallStatus === 'HIGH_RISK' ? '#ef4444' : overallStatus === 'CAUTION' ? '#f59e0b' : '#10b981'
        }}></div>
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <RiskBadge status={overallStatus} size="lg" />
            <div>
              <p className="text-body-sm font-body-sm text-on-surface-variant font-mono">
                Based on: <strong className="text-on-surface">{profileContext}</strong>
              </p>
            </div>
          </div>
          {explanation && (
            <p className="text-body-md font-body-md text-on-surface-variant max-w-3xl leading-relaxed">{explanation}</p>
          )}
        </div>
      </section>

      {/* Risk Breakdown */}
      <section className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4">
        <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
          Risk Breakdown by Category
        </h2>
        <div className="space-y-3">
          {Object.entries(breakdown || {}).map(([key, cat]) => (
            <div key={key} className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-high border border-outline-variant">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{CATEGORY_LABELS[key]?.icon || 'info'}</span>
                <span className="text-body-md font-body-md text-on-surface">{CATEGORY_LABELS[key]?.label || key}</span>
              </div>
              <RiskBadge status={cat.status} />
            </div>
          ))}
        </div>
      </section>

      {/* Clinical Findings */}
      {(allergenFindings?.length > 0 || ingredientFindings?.length > 0 || nutritionFindings?.length > 0) && (
        <section className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4">
          <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">lab_research</span>
            Clinical Flags & Inference
          </h2>
          <div className="space-y-3">
            {allergenFindings?.map((f, i) => (
              <div key={i} className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 space-y-1">
                <div className="flex items-center gap-2">
                  <RiskBadge status="HIGH_RISK" />
                  <span className="text-body-md font-semibold text-on-surface">{f.matchedIngredient} detected</span>
                </div>
                <div className="flex flex-wrap gap-x-4 text-body-sm font-body-sm text-on-surface-variant">
                  <span>Allergen: <strong className="text-red-300">{f.allergenName}</strong></span>
                  <span>Confidence: <strong className="text-on-surface uppercase">{f.confidence}</strong></span>
                </div>
              </div>
            ))}
            {ingredientFindings?.map((f, i) => (
              <div key={i} className="p-4 rounded-lg bg-surface-container-high border border-outline-variant space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge status={f.status} />
                  <span className="text-body-md font-semibold text-on-surface">{f.ingredient}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 text-body-sm font-body-sm text-on-surface-variant">
                  <span>Category: <strong className="text-on-surface">{f.category?.replace(/_/g, ' ')}</strong></span>
                  <span>Relevant to: <strong className="text-primary">{f.relevantProfileFactor?.replace(/_/g, ' ')}</strong></span>
                  <span>Confidence: <strong className="text-on-surface uppercase">{f.confidence}</strong></span>
                </div>
                <p className="text-body-sm text-on-surface-variant">{f.reason}</p>
              </div>
            ))}
            {nutritionFindings?.map((f, i) => (
              <div key={i} className="p-4 rounded-lg bg-surface-container-high border border-outline-variant space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge status={f.status} />
                  <span className="text-body-md font-semibold text-on-surface">
                    {f.nutrient?.replace(/_/g, ' ')} = {f.value}{f.unit}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 text-body-sm font-body-sm text-on-surface-variant">
                  <span>Condition: <strong className="text-primary">{f.conditionName}</strong></span>
                  <span>Threshold: <strong className="text-on-surface">{f.threshold}{f.unit}</strong></span>
                  <span>Confidence: <strong className="text-on-surface">HIGH</strong></span>
                </div>
                <p className="text-body-sm text-on-surface-variant">{f.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nutrition Snapshot */}
      {nutritionSummary && Object.values(nutritionSummary).some(v => v !== null) && (
        <section className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4">
          <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">nutrition</span>
            Nutrition Snapshot (Per Serving)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'calories', label: 'Calories', unit: 'kcal' },
              { key: 'carbohydrates', label: 'Carbohydrates', unit: 'g' },
              { key: 'added_sugar', label: 'Added Sugar', unit: 'g' },
              { key: 'sodium', label: 'Sodium', unit: 'mg' },
              { key: 'protein', label: 'Protein', unit: 'g' },
              { key: 'fat', label: 'Total Fat', unit: 'g' },
              { key: 'potassium', label: 'Potassium', unit: 'mg' },
              { key: 'phosphorus', label: 'Phosphorus', unit: 'mg' },
            ].map(({ key, label, unit }) => nutritionSummary[key] !== null && nutritionSummary[key] !== undefined ? (
              <div key={key} className="p-3.5 rounded-lg bg-surface-container-high border border-outline-variant">
                <div className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">{label}</div>
                <div className="text-headline-sm font-headline-sm font-bold text-on-surface mt-1">
                  {nutritionSummary[key]}<span className="text-label-sm font-label-sm text-on-surface-variant ml-1">{unit}</span>
                </div>
              </div>
            ) : null)}
          </div>
        </section>
      )}

      {/* Confidence + Limitations */}
      <section className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4">
        <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
          Information Confidence
        </h2>
        <div className="space-y-3">
          <ConfidenceBar label="Ingredient Match" level={confidence?.ingredient_match} />
          <ConfidenceBar label="Nutrition Information" level={confidence?.nutrition_info} />
          <ConfidenceBar label="Allergen Information" level={confidence?.allergen_info} />
        </div>
        {limitations && limitations.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-surface-container-low border border-outline-variant flex items-start gap-3">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] mt-0.5">info</span>
            <div className="space-y-1">
              {limitations.slice(0, 2).map((l, i) => (
                <p key={i} className="text-body-sm font-body-sm text-on-surface-variant">{l}</p>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* AI Chatbot */}
      <section className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
          <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">Ask NutriShield AI</h2>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/20 border border-primary-container/30 text-primary text-label-sm font-label-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
            Active
          </span>
        </div>

        {/* Chat History */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-xl text-body-sm font-body-sm ${
                msg.role === 'user'
                  ? 'bg-primary-container text-on-primary rounded-br-sm'
                  : 'bg-surface-container-high border border-outline-variant text-on-surface rounded-bl-sm'
              }`}>
                {msg.role === 'assistant' && <span className="font-mono text-primary text-[10px] block mb-1">NutriShield AI</span>}
                {msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-surface-container-high border border-outline-variant px-4 py-2.5 rounded-xl rounded-bl-sm">
                <span className="material-symbols-outlined animate-spin text-primary text-[16px]">refresh</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick questions */}
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => setChatInput(q)} className="px-3 py-1 rounded-full border border-outline-variant text-on-surface-variant text-body-sm hover:border-primary hover:text-primary transition-colors">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChat()}
            placeholder="Ask a follow-up question about this food..."
            className="flex-1 bg-surface-container-high border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <button
            onClick={handleChat}
            disabled={!chatInput.trim() || chatLoading}
            className="px-4 py-2.5 rounded-lg bg-primary-container text-on-primary hover:brightness-110 disabled:opacity-50 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </section>
    </main>
  );
}
