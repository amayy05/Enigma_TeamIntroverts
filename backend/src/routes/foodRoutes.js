const express = require('express');
const router = express.Router();
const { analyzeIngredients } = require('../ingredientAnalyzer');
const { analyzeNutrition } = require('../nutritionAnalyzer');
const { runRiskEngine } = require('../riskEngine');
const { generateExplanation, extractLabelFromImage } = require('../llmService');
const demoFoods = require('../../data/demoFoods.json');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// In-memory profile store (per session — use DB for production)
let userProfile = {
  conditions: [],
  allergies: [],
  dietaryRestrictions: []
};

// GET /api/demo-foods
router.get('/demo-foods', (req, res) => {
  const summary = demoFoods.map(f => ({
    id: f.id,
    name: f.name,
    description: f.description,
    notes: f.notes
  }));
  res.json({ demoFoods: summary });
});

// GET /api/demo-foods/:id
router.get('/demo-foods/:id', (req, res) => {
  const food = demoFoods.find(f => f.id === req.params.id);
  if (!food) return res.status(404).json({ error: 'Demo food not found' });
  res.json(food);
});

// GET /api/ingredients/:name
router.get('/ingredients/:name', (req, res) => {
  const { findIngredient } = require('../ingredientAnalyzer');
  const match = findIngredient(req.params.name);
  if (!match) return res.status(404).json({ error: 'Ingredient not found in knowledge base' });
  res.json(match);
});

// POST /api/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { food, profile } = req.body;

    if (!food) {
      return res.status(400).json({ error: 'Food information is required.' });
    }

    const activeProfile = profile || userProfile;

    // Step 1: Ingredient Analysis
    const ingredientAnalysis = analyzeIngredients(
      food.ingredients || '',
      activeProfile
    );

    // Step 2: Nutrition Analysis
    const nutritionAnalysis = analyzeNutrition(
      food.nutrition || {},
      activeProfile
    );

    // Step 3: Risk Engine (rule-based, authoritative)
    const riskResult = runRiskEngine(ingredientAnalysis, nutritionAnalysis, activeProfile);

    // Step 4: LLM Explanation (over structured output — does NOT change risk)
    let explanation = null;
    try {
      explanation = await generateExplanation(riskResult, food.name || 'This food', activeProfile);
    } catch (e) {
      explanation = null;
    }

    res.json({
      success: true,
      food: { name: food.name || 'Unnamed Food' },
      profile: activeProfile,
      result: riskResult,
      explanation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// POST /api/extract-label
router.post('/extract-label', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    const result = await extractLabelFromImage(base64Image, mimeType);
    if (result.error) {
      return res.status(500).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: 'Label extraction failed. Please try again.' });
  }
});

module.exports = router;
