import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Analyzer from './pages/Analyzer';
import Results from './pages/Results';
import { api } from './services/api';

const DEFAULT_PROFILE = {
  name: 'User',
  conditions: [],
  allergies: [],
  dietaryRestrictions: [],
};

export default function App() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('nutrishield_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
  });
  const [demoFoods, setDemoFoods] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [initialDemoId, setInitialDemoId] = useState(null);

  // Load demo foods on startup
  useEffect(() => {
    api.getDemoFoods()
      .then(res => setDemoFoods(res.demoFoods || []))
      .catch(() => {
        // Fallback static demo foods if backend not running
        setDemoFoods([
          { id: 'sugar-free-biscuit', name: 'Sugar-Free Biscuit', description: 'Hidden glycemic impact' },
          { id: 'instant-noodles', name: 'Instant Noodles', description: 'Extreme sodium content' },
          { id: 'spice-mix', name: 'Spice Mix', description: 'Ambiguous protein source' },
          { id: 'milk-chocolate', name: 'Milk Chocolate', description: 'Dairy + high sugar' },
          { id: 'packaged-juice', name: 'Packaged Juice', description: 'Hidden added sugars' },
          { id: 'protein-bar', name: 'Protein Bar', description: 'Multiple allergen risk' },
          { id: 'breakfast-cereal', name: 'Breakfast Cereal', description: 'Sugar + refined carbs' },
          { id: 'salad-dressing', name: 'Salad Dressing', description: 'High sodium + unknown flavors' },
        ]);
      });
    // Load profile from backend
    api.getProfile()
      .then(res => { if (res.profile) setProfile(res.profile); })
      .catch(() => {}); // Use localStorage fallback
  }, []);

  function handleSaveProfile(p) {
    setProfile(p);
    localStorage.setItem('nutrishield_profile', JSON.stringify(p));
  }

  function handleResult(result) {
    setAnalysisResult(result);
  }

  function handleAnalyzeDemo(id) {
    setInitialDemoId(id);
    navigate('/analyze');
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      <Sidebar profile={profile} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopNav profile={profile} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={
              <Dashboard
                profile={profile}
                demoFoods={demoFoods}
                onAnalyzeDemo={handleAnalyzeDemo}
              />
            } />
            <Route path="/analyze" element={
              <Analyzer
                profile={profile}
                demoFoods={demoFoods}
                initialFoodId={initialDemoId}
                onResult={handleResult}
              />
            } />
            <Route path="/profile" element={
              <Profile
                profile={profile}
                onSave={handleSaveProfile}
              />
            } />
            <Route path="/results" element={
              <Results
                analysisResult={analysisResult}
                profile={profile}
              />
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}
