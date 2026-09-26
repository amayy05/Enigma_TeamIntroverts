import { useState } from 'react';
import { api } from '../services/api';

const CONDITIONS = [
  { key: 'diabetes', label: 'Diabetes', icon: 'water_drop', desc: 'Blood sugar focus' },
  { key: 'ckd', label: 'Kidney Care (CKD)', icon: 'monitor_heart', desc: 'Na, K, P limits' },
  { key: 'hypertension', label: 'Hypertension', icon: 'cardiology', desc: 'Sodium focus' },
  { key: 'pcos', label: 'PCOS', icon: 'healing', desc: 'Insulin focus' },
];

const ALLERGIES = [
  { key: 'peanut_allergy', label: 'Peanuts', icon: 'nutrition' },
  { key: 'milk_allergy', label: 'Dairy', icon: 'no_drinks' },
  { key: 'soy_allergy', label: 'Soy', icon: 'nutrition' },
  { key: 'wheat_allergy', label: 'Wheat', icon: 'grain' },
  { key: 'tree_nut_allergy', label: 'Tree Nuts', icon: 'nutrition' },
];

export default function Profile({ profile, onSave }) {
  const [local, setLocal] = useState(profile || { name: 'User', conditions: [], allergies: [], dietaryRestrictions: [] });
  const [saving, setSaving] = useState(false);

  function toggle(section, key) {
    setLocal(prev => {
      const arr = prev[section] || [];
      return { ...prev, [section]: arr.includes(key) ? arr.filter(x => x !== key) : [...arr, key] };
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.saveProfile(local);
      onSave(local);
    } catch (e) {
      onSave(local); // offline fallback
    }
    setSaving(false);
  }

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="font-display text-5xl text-on-surface">Your Dietary Profile</h1>
        <p className="font-sans text-lg text-on-surface-variant max-w-2xl mx-auto">
          Tell us about your body. We'll personalize every food scan so you know exactly how an ingredient affects you.
        </p>
      </div>

      <div className="bg-surface-container rounded-3xl p-8 space-y-6 shadow-sm">
        <h2 className="font-display text-2xl text-on-surface">What should we call you?</h2>
        <input
          type="text"
          value={local.name}
          onChange={e => setLocal(p => ({ ...p, name: e.target.value }))}
          className="w-full max-w-md bg-white border border-outline-variant rounded-2xl px-6 py-4 font-sans text-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Your name"
        />
      </div>

      <div className="bg-surface-container rounded-3xl p-8 space-y-6 shadow-sm">
        <h2 className="font-display text-2xl text-on-surface">Health Focus Areas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONDITIONS.map(({ key, label, icon, desc }) => {
            const active = local.conditions.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggle('conditions', key)}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left border-2 ${
                  active ? 'bg-white border-primary shadow-soft' : 'bg-surface-container-high border-transparent hover:bg-white'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${active ? 'bg-primary text-white' : 'bg-surface text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                  <div className={`font-bold font-sans ${active ? 'text-primary' : 'text-on-surface'}`}>{label}</div>
                  <div className="text-sm font-sans text-on-surface-variant">{desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[#F8E0DD] rounded-3xl p-8 space-y-6 shadow-sm">
        <h2 className="font-display text-2xl text-on-surface">Allergies to Avoid</h2>
        <div className="flex flex-wrap gap-3">
          {ALLERGIES.map(({ key, label }) => {
            const active = local.allergies.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggle('allergies', key)}
                className={`px-6 py-3 rounded-full font-bold font-sans transition-all duration-200 ${
                  active ? 'bg-risk-high text-white shadow-soft' : 'bg-white text-on-surface-variant hover:bg-risk-high/10'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-10 py-4 rounded-full bg-primary text-white font-bold text-lg hover:scale-105 shadow-float transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile Details'}
        </button>
      </div>
    </main>
  );
}
