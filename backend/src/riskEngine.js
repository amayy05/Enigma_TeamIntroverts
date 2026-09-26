/**
 * PERSONALIZED RISK ENGINE
 *
 * This is the authoritative decision layer.
 * The LLM must NOT independently determine risk classification.
 * Risk status hierarchy: HIGH_RISK > CAUTION > VERIFY > LOWER_CONCERN
 */

const STATUS_PRIORITY = {
  'HIGH_RISK': 4,
  'CAUTION': 3,
  'VERIFY': 2,
  'LOWER_CONCERN': 1
};

/**
 * Determines the overall risk status from all findings.
 */
function getOverallStatus(allFindings) {
  if (!allFindings || allFindings.length === 0) return 'LOWER_CONCERN';
  let highestPriority = 0;
  let status = 'LOWER_CONCERN';
  for (const finding of allFindings) {
    const priority = STATUS_PRIORITY[finding.status] || 0;
    if (priority > highestPriority) {
      highestPriority = priority;
      status = finding.status;
    }
  }
  return status;
}

/**
 * Builds the category-level risk breakdown.
 * Categories: allergens, blood_sugar, sodium, kidney_related, dietary_restrictions
 */
function buildRiskBreakdown(allergenFindings, ingredientFindings, nutritionFindings, userProfile) {
  const breakdown = {
    allergens: { status: 'LOWER_CONCERN', label: 'Allergens', findings: [] },
    blood_sugar: { status: 'LOWER_CONCERN', label: 'Blood Sugar / Glycemic', findings: [] },
    sodium: { status: 'LOWER_CONCERN', label: 'Sodium / Blood Pressure', findings: [] },
    kidney_related: { status: 'LOWER_CONCERN', label: 'Kidney-Related', findings: [] },
    dietary_restrictions: { status: 'LOWER_CONCERN', label: 'Dietary Restrictions', findings: [] }
  };

  // Allergen findings
  for (const f of allergenFindings) {
    breakdown.allergens.status = 'HIGH_RISK';
    breakdown.allergens.findings.push(f);
  }

  // Ingredient findings — categorize
  for (const f of ingredientFindings) {
    if (f.status === 'VERIFY') {
      const currentPriority = STATUS_PRIORITY[breakdown.allergens.status] || 0;
      if (STATUS_PRIORITY['VERIFY'] > currentPriority) {
        breakdown.allergens.status = 'VERIFY';
      }
      breakdown.allergens.findings.push(f);
    }

    const cat = f.category || '';
    const cond = f.relevantProfileFactor || '';

    if (['added_sugar', 'carbohydrate_related', 'refined_carbohydrate'].includes(cat) ||
        ['diabetes', 'pcos'].includes(cond)) {
      if (STATUS_PRIORITY[f.status] > STATUS_PRIORITY[breakdown.blood_sugar.status]) {
        breakdown.blood_sugar.status = f.status;
      }
      breakdown.blood_sugar.findings.push(f);
    }

    if (['sodium_source'].includes(cat) || cond === 'hypertension') {
      if (STATUS_PRIORITY[f.status] > STATUS_PRIORITY[breakdown.sodium.status]) {
        breakdown.sodium.status = f.status;
      }
      breakdown.sodium.findings.push(f);
    }

    if (['potassium_source', 'phosphorus_source'].includes(cat) || cond === 'ckd') {
      if (STATUS_PRIORITY[f.status] > STATUS_PRIORITY[breakdown.kidney_related.status]) {
        breakdown.kidney_related.status = f.status;
      }
      breakdown.kidney_related.findings.push(f);
    }
  }

  // Nutrition findings — categorize
  for (const f of nutritionFindings) {
    if (['added_sugar', 'total_sugar', 'carbohydrates'].includes(f.nutrient) ||
        ['diabetes', 'pcos'].includes(f.condition)) {
      if (STATUS_PRIORITY[f.status] > STATUS_PRIORITY[breakdown.blood_sugar.status]) {
        breakdown.blood_sugar.status = f.status;
      }
      breakdown.blood_sugar.findings.push(f);
    }

    if (f.nutrient === 'sodium' && ['hypertension', 'ckd', 'low_sodium'].includes(f.condition)) {
      if (STATUS_PRIORITY[f.status] > STATUS_PRIORITY[breakdown.sodium.status]) {
        breakdown.sodium.status = f.status;
      }
      breakdown.sodium.findings.push(f);
    }

    if (['potassium', 'phosphorus'].includes(f.nutrient) || f.condition === 'ckd') {
      if (STATUS_PRIORITY[f.status] > STATUS_PRIORITY[breakdown.kidney_related.status]) {
        breakdown.kidney_related.status = f.status;
      }
      breakdown.kidney_related.findings.push(f);
    }

    if (['low_sodium', 'low_sugar'].includes(f.condition)) {
      if (STATUS_PRIORITY[f.status] > STATUS_PRIORITY[breakdown.dietary_restrictions.status]) {
        breakdown.dietary_restrictions.status = f.status;
      }
      breakdown.dietary_restrictions.findings.push(f);
    }
  }

  return breakdown;
}

/**
 * Deduplicates findings — avoids duplicate entries for same ingredient/nutrient.
 */
function deduplicateFindings(findings) {
  const seen = new Set();
  return findings.filter(f => {
    const key = `${f.ingredient || f.nutrient}_${f.condition || f.relevantProfileFactor}_${f.status}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Main risk engine function.
 * Takes structured ingredient and nutrition analysis results.
 * Returns the final structured risk result.
 */
function runRiskEngine(ingredientAnalysis, nutritionAnalysis, userProfile) {
  const { allergenFindings = [], findings: ingredientFindings = [], missingInformation: ingredientMissing = [] } = ingredientAnalysis;
  const { findings: nutritionFindings = [], missingNutrients = [], nutritionSummary } = nutritionAnalysis;

  // Combine all findings
  const allFindings = [
    ...allergenFindings.map(f => ({ ...f, type: 'allergen' })),
    ...deduplicateFindings(ingredientFindings),
    ...deduplicateFindings(nutritionFindings)
  ];

  const overallStatus = getOverallStatus(allFindings);
  const breakdown = buildRiskBreakdown(allergenFindings, ingredientFindings, nutritionFindings, userProfile);

  // Build limitations
  const limitations = [];
  if (ingredientMissing.length > 0) limitations.push(...ingredientMissing);
  if (missingNutrients.length > 0) {
    limitations.push('Some nutrition values were not provided — analysis may be incomplete.');
  }
  limitations.push('Analysis is based on information available. Ingredient sources may vary by manufacturer batch.');
  limitations.push('This is not a substitute for professional medical or dietary advice.');

  // Build confidence levels
  const confidence = {
    ingredient_match: allergenFindings.length > 0 || ingredientFindings.length > 0 ? 'high' : 'medium',
    nutrition_info: nutritionSummary && Object.values(nutritionSummary).some(v => v !== null) ? 'high' : 'low',
    allergen_info: allergenFindings.some(f => f.confidence === 'low') ? 'medium' : 'high'
  };

  return {
    overallStatus,
    breakdown,
    allergenFindings,
    ingredientFindings: deduplicateFindings(ingredientFindings),
    nutritionFindings: deduplicateFindings(nutritionFindings),
    allFindings,
    nutritionSummary,
    limitations,
    confidence,
    profileSummary: {
      conditions: userProfile?.conditions || [],
      allergies: userProfile?.allergies || [],
      dietaryRestrictions: userProfile?.dietaryRestrictions || []
    }
  };
}

module.exports = { runRiskEngine, getOverallStatus, STATUS_PRIORITY };
