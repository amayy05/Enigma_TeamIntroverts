import { useState } from 'react';
import { api } from '../services/api';

const CONDITIONS = [
  { key: 'diabetes', label: 'Diabetes', icon: 'water_drop', desc: 'Blood glucose management' },
  { key: 'ckd', label: 'Chronic Kidney Disease (CKD)', icon: 'monitor_heart', desc: 'Na, K, P restrictions' },
  { key: 'hypertension', label: 'Hypertension', icon: 'cardiology', desc: 'Sodium restriction' },
  { key: 'pcos', label: 'PCOS', icon: 'healing', desc: 'Insulin sensitivity' },
];

const ALLERGIES = [
  { key: 'peanut_allergy', label: 'Peanut', icon: 'warning' },
  { key: 'milk_allergy', label: 'Milk / Dairy', icon: 'no_drinks' },
  { key: 'soy_allergy', label: 'Soy', icon: 'warning' },
  { key: 'wheat_allergy', label: 'Wheat', icon: 'grain' },
  { key: 'tree_nut_allergy', label: 'Tree Nuts', icon: 'warning' },
];

const DIETARY = [
  { key: 'vegetarian', label: 'Vegetarian', icon: 'eco' },
  { key: 'vegan', label: 'Vegan', icon: 'spa' },
  { key: 'gluten_free', label: 'Gluten-Free', icon: 'grain' },
  { key: 'low_sodium', label: 'Low-Sodium', icon: 'water_drop' },
  { key: 'low_sugar', label: 'Low-Sugar', icon: 'energy_savings_leaf' },
];

export default function Profile({ profile, onSave }) {
  const [local, setLocal] = useState(profile || { name: 'User', conditions: [], allergies: [], dietaryRestrictions: [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(section, key) {
    setLocal(prev => {
      const arr = prev[section] || [];
      return {
        ...prev,
        [section]: arr.includes(key) ? arr.filter(x => x !== key) : [...arr, key],
      };
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.saveProfile(local);
      onSave(local);
      setSaved(true);
    } catch (e) {
      // Offline fallback — save locally
      onSave(local);
      setSaved(true);
    }
    setSaving(false);
  }

  const completeness = Math.round(
    ((local.conditions.length > 0 ? 25 : 0) +
     (local.allergies.length > 0 ? 25 : 0) +
     (local.dietaryRestrictions.length > 0 ? 25 : 0) +
     (local.name && local.name !== 'User' ? 25 : 0))
  );

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Completeness Banner */}
      <section className="bg-surface-container-high border border-outline-variant rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 flex-1 w-full">
            <div className="flex items-center justify-between max-w-lg mb-1">
              <span className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                Profile Completeness
              </span>
              <span className="text-label-md font-label-md text-primary font-bold">{completeness}% Complete</span>
            </div>
            <div className="w-full max-w-lg bg-surface-container-lowest h-2.5 rounded-full overflow-hidden border border-outline-variant">
              <div className="bg-primary-container h-full rounded-full transition-all duration-500" style={{ width: `${completeness}%` }}></div>
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant pt-1">
              {completeness < 100 ? 'Complete your profile for the most accurate risk analysis.' : 'Profile fully configured — maximum precision active.'}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/15 border border-primary-container/40 text-primary text-label-md font-label-md">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
            High Precision Shield Active
          </span>
        </div>
      </section>

      {/* Header + Save */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2 text-primary font-label-md text-label-md uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[14px]">shield_with_heart</span>
            Bio-Engineered Safeguards
          </div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">My Health Profile</h1>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-2xl mt-1">
            Configure your dietary risk filters. Your profile determines which ingredients and nutrients are flagged.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-60">
            <span className="material-symbols-outlined text-[16px]">{saved ? 'check_circle' : 'save'}</span>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Name */}
      <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">person</span>
          <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">Your Name</h2>
        </div>
        <input
          type="text"
          value={local.name}
          onChange={e => { setLocal(p => ({ ...p, name: e.target.value })); setSaved(false); }}
          className="w-full max-w-sm bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          placeholder="Your name"
        />
      </div>

      {/* Health Conditions */}
      <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">medical_services</span>
            <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">Health Conditions</h2>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Select all that apply. Algorithms calculate nutrient limits based on your conditions.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {CONDITIONS.map(({ key, label, icon, desc }) => {
            const active = local.conditions.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggle('conditions', key)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                  active
                    ? 'bg-primary-container/20 border-primary-container text-primary'
                    : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{label}</div>
                  <div className="text-[10px] font-mono opacity-70">{desc}</div>
                </div>
                {active && <span className="material-symbols-outlined text-[14px] text-primary ml-1">check_circle</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Allergies */}
      <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[18px]">warning</span>
            <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">Food Allergies</h2>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Ingredients containing these will trigger HIGH RISK alerts immediately during scan.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {ALLERGIES.map(({ key, label, icon }) => {
            const active = local.allergies.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggle('allergies', key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                  active
                    ? 'bg-red-500/20 border-red-500/60 text-red-300'
                    : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                {label}
                {active && <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">restaurant</span>
            <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">Dietary Preferences & Restrictions</h2>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Lifestyle rules and dietary goals for ingredient recommendations.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {DIETARY.map(({ key, label, icon }) => {
            const active = local.dietaryRestrictions.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggle('dietaryRestrictions', key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                  active
                    ? 'bg-primary-container/20 border-primary-container text-primary'
                    : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                {label}
                {active && <span className="material-symbols-outlined text-[12px] text-primary ml-0.5">check</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Disclaimer + Save */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            <strong className="text-on-surface">Privacy:</strong> Your profile is used only for personalized risk detection. NutriShield does not diagnose or treat any medical condition. Always consult certified clinical dietary practitioners.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary-container text-on-primary font-bold text-sm hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-60">
          <span className="material-symbols-outlined text-[18px]">{saved ? 'check_circle' : 'save'}</span>
          {saving ? 'Saving...' : saved ? 'Profile Saved!' : 'Save Profile & Update Risk Model'}
        </button>
      </div>
    </main>
  );
}
