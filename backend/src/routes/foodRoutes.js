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

// In-memory history store
let userHistory = [];

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

    // Step 0: Infer ingredients if unlabelled street food
    let finalIngredients = food.ingredients || '';
    let isUnlabelled = false;
    
    if (!finalIngredients.trim() && food.name) {
      const { inferIngredients } = require('../llmService');
      finalIngredients = await inferIngredients(food.name);
      isUnlabelled = true;
    }

    // Step 1: Ingredient Analysis
    const ingredientAnalysis = analyzeIngredients(
      finalIngredients,
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

    const finalResult = {
      success: true,
      food: { name: food.name || 'Unnamed Food' },
      profile: activeProfile,
      result: riskResult,
      explanation: isUnlabelled 
        ? `Note: Because no ingredients were provided, I inferred the standard ingredients for "${food.name}" (${finalIngredients}) to run this analysis.\n\n${explanation || ''}`
        : explanation,
      timestamp: new Date().toISOString()
    };
    
    // Add to history
    userHistory.unshift({
      name: finalResult.food.name,
      status: riskResult.overallStatus,
      detail: (riskResult.allergenFindings[0]?.matchedIngredient || riskResult.ingredientFindings[0]?.ingredient || riskResult.nutritionFindings[0]?.nutrient || 'Analyzed successfully'),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
    // Keep last 10
    if(userHistory.length > 10) userHistory.pop();

    res.json(finalResult);

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

// GET /api/barcode/:code
router.get('/barcode/:code', async (req, res) => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${req.params.code}.json`);
    const data = await response.json();
    
    if (data.status !== 1) {
      return res.status(404).json({ error: 'Product not found in Open Food Facts database.' });
    }
    
    const product = data.product;
    const ingredients = product.ingredients_text || '';
    const nutriments = product.nutriments || {};
    
    // Map to our nutrition schema
    const nutrition = {};
    if (nutriments['energy-kcal_100g'] !== undefined) nutrition.calories = nutriments['energy-kcal_100g'];
    if (nutriments.carbohydrates_100g !== undefined) nutrition.carbohydrates = nutriments.carbohydrates_100g;
    if (nutriments.sugars_100g !== undefined) nutrition.total_sugar = nutriments.sugars_100g;
    if (nutriments.sodium_100g !== undefined) nutrition.sodium = nutriments.sodium_100g * 1000; // OFF returns g, we need mg
    if (nutriments.proteins_100g !== undefined) nutrition.protein = nutriments.proteins_100g;
    if (nutriments.fat_100g !== undefined) nutrition.fat = nutriments.fat_100g;

    res.json({
      name: product.product_name || 'Unknown Product',
      ingredients,
      nutrition
    });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    res.status(500).json({ error: 'Barcode lookup failed.' });
  }
});

// GET /api/history
router.get('/history', (req, res) => {
  res.json({ history: userHistory });
});

// POST /api/compare
router.post('/compare', async (req, res) => {
  try {
    const { foodA, foodB, profile } = req.body;
    if (!foodA || !foodB) return res.status(400).json({ error: 'Two foods are required.' });
    
    const activeProfile = profile || userProfile;

    const analyzeFood = (food) => {
      const ing = analyzeIngredients(food.ingredients || '', activeProfile);
      const nut = analyzeNutrition(food.nutrition || {}, activeProfile);
      return runRiskEngine(ing, nut, activeProfile);
    };

    const resultA = analyzeFood(foodA);
    const resultB = analyzeFood(foodB);

    let explanation = null;
    try {
      const { generateComparison } = require('../llmService');
      explanation = await generateComparison(resultA, resultB, foodA.name, foodB.name, activeProfile);
    } catch (e) {
      explanation = null;
    }

    res.json({
      success: true,
      foodA: { name: foodA.name || 'Product A' },
      foodB: { name: foodB.name || 'Product B' },
      resultA,
      resultB,
      explanation,
      profile: activeProfile,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: 'Comparison failed.' });
  }
});

// POST /api/compare-chat
router.post('/compare-chat', async (req, res) => {
  try {
    const { question, resultA, resultB, foodAName, foodBName, profile } = req.body;
    const { answerComparisonChat } = require('../llmService');
    const answer = await answerComparisonChat(question, resultA, resultB, foodAName, foodBName, profile);
    res.json({ answer });
  } catch(e) {
    res.status(500).json({ error: 'Chat failed' });
  }
});

module.exports = router;
