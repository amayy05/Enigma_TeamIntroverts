const conditionsDB = require('../data/conditions.json');

/**
 * Analyzes nutrition data against user conditions and dietary restrictions.
 * Returns structured findings per condition.
 */
function analyzeNutrition(nutritionData, userProfile) {
  const findings = [];
  const missingNutrients = [];

  if (!nutritionData || Object.keys(nutritionData).length === 0) {
    return { findings, missingNutrients: ['No nutrition information provided.'], nutritionSummary: null };
  }

  const userConditions = userProfile?.conditions || [];
  const userDietary = userProfile?.dietaryRestrictions || [];

  // Check each user condition against nutrition thresholds
  for (const conditionKey of userConditions) {
    const conditionData = conditionsDB[conditionKey];
    if (!conditionData) continue;

    for (const [nutrient, threshold] of Object.entries(conditionData.nutritionThresholds || {})) {
      const nutrientKey = nutrient.replace(/-/g, '_');
      const value = nutritionData[nutrientKey];

      if (value === null || value === undefined || value === '') {
        missingNutrients.push({ nutrient, condition: conditionData.name });
        continue;
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue)) continue;

      if (numValue >= threshold.caution) {
        findings.push({
          type: 'nutrition',
          nutrient,
          value: numValue,
          unit: threshold.unit,
          threshold: threshold.caution,
          condition: conditionKey,
          conditionName: conditionData.name,
          status: 'CAUTION',
          confidence: 'high',
          reason: threshold.message,
          evidence: `Detected ${numValue}${threshold.unit} per serving — threshold for ${conditionData.name} is ${threshold.caution}${threshold.unit}.`
        });
      }
    }
  }

  // Check dietary restriction thresholds
  for (const restriction of userDietary) {
    if (restriction === 'low_sodium') {
      const sodium = parseFloat(nutritionData.sodium);
      if (!isNaN(sodium) && sodium > 140) {
        findings.push({
          type: 'nutrition',
          nutrient: 'sodium',
          value: sodium,
          unit: 'mg',
          threshold: 140,
          condition: 'low_sodium',
          conditionName: 'Low-Sodium Diet',
          status: 'CAUTION',
          confidence: 'high',
          reason: 'Sodium content exceeds low-sodium dietary threshold (140mg per serving).',
          evidence: `Detected ${sodium}mg sodium per serving.`
        });
      }
    }
    if (restriction === 'low_sugar') {
      const addedSugar = parseFloat(nutritionData.added_sugar);
      if (!isNaN(addedSugar) && addedSugar > 5) {
        findings.push({
          type: 'nutrition',
          nutrient: 'added_sugar',
          value: addedSugar,
          unit: 'g',
          threshold: 5,
          condition: 'low_sugar',
          conditionName: 'Low-Sugar Diet',
          status: 'CAUTION',
          confidence: 'high',
          reason: 'Added sugar exceeds low-sugar dietary preference.',
          evidence: `Detected ${addedSugar}g added sugar per serving.`
        });
      }
    }
  }

  // Build nutrition summary
  const nutritionSummary = {
    calories: nutritionData.calories || null,
    carbohydrates: nutritionData.carbohydrates || null,
    added_sugar: nutritionData.added_sugar || null,
    total_sugar: nutritionData.total_sugar || null,
    sodium: nutritionData.sodium || null,
    potassium: nutritionData.potassium || null,
    phosphorus: nutritionData.phosphorus || null,
    protein: nutritionData.protein || null,
    fat: nutritionData.fat || null
  };

  return { findings, missingNutrients, nutritionSummary };
}

module.exports = { analyzeNutrition };
