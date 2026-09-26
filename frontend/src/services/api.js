/**
 * NutriShield API Service
 * All calls to the backend at /api
 */

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Profile
  getProfile: () => request('/profile'),
  saveProfile: (profile) => request('/profile', { method: 'POST', body: JSON.stringify(profile) }),
  getHistory: () => request('/history'),

  // Food Analysis
  analyze: (food, profile) => request('/analyze', {
    method: 'POST',
    body: JSON.stringify({ food, profile }),
  }),
  compare: (foodA, foodB, profile) => request('/compare', {
    method: 'POST',
    body: JSON.stringify({ foodA, foodB, profile }),
  }),

  // Demo Foods
  getDemoFoods: () => request('/demo-foods'),
  getDemoFood: (id) => request(`/demo-foods/${id}`),

  // Barcode Lookup
  lookupBarcode: (code) => request(`/barcode/${code}`),

  // Chatbot
  chat: (question, riskResult, foodName, profile) => request('/chat', {
    method: 'POST',
    body: JSON.stringify({ question, riskResult, foodName, profile }),
  }),
  compareChat: (question, resultA, resultB, foodAName, foodBName, profile) => request('/compare-chat', {
    method: 'POST',
    body: JSON.stringify({ question, resultA, resultB, foodAName, foodBName, profile })
  }),

  // Image Extraction
  extractLabel: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${BASE}/extract-label`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }
};
