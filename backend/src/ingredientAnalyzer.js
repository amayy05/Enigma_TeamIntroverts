const ingredientDB = require('../data/ingredients.json');
const allergenDB = require('../data/allergens.json');

/**
 * Normalizes an ingredient string to lowercase, trimmed.
 */
function normalize(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').trim();
}

/**
 * Finds a matching ingredient entry from the knowledge base.
 * Checks both keys and aliases.
 */
function findIngredient(ingredientName) {
  const normalized = normalize(ingredientName);
  for (const [key, data] of Object.entries(ingredientDB)) {
    if (normalize(key) === normalized) return { key, ...data };
    if (data.aliases && data.aliases.some(alias => normalize(alias) === normalized)) {
      return { key, ...data };
    }
    // Partial match for longer ingredient names
    if (normalize(key).includes(normalized) || normalized.includes(normalize(key))) {
      if (normalized.length > 3 && normalize(key).length > 3) {
        return { key, ...data };
      }
    }
  }
  return null;
}

/**
 * Checks if an ingredient matches any allergen from the user profile.
 */
function checkAllergen(ingredientName, userAllergies) {
  const normalized = normalize(ingredientName);
  const findings = [];
  for (const allergyKey of userAllergies) {
    const allergenData = allergenDB[allergyKey];
    if (!allergenData) continue;
    const isDirectMatch = allergenData.aliases.some(alias => {
      const aliasNorm = normalize(alias);
      return normalized === aliasNorm || normalized.includes(aliasNorm) || aliasNorm.includes(normalized);
    });
    if (isDirectMatch) {
      findings.push({
        allergen: allergyKey,
        allergenName: allergenData.name,
        matchedIngredient: ingredientName,
        confidence: 'high',
        status: 'HIGH_RISK'
      });
    }
  }
  return findings;
}

/**
 * Checks if an ambiguous ingredient could be allergen-relevant.
 */
function checkAmbiguousAllergen(ingredientEntry, userAllergies) {
  if (!ingredientEntry || ingredientEntry.riskLevel !== 'verify') return null;
  const ambiguousAllergenCategories = ['ambiguous_protein', 'ambiguous_flavoring'];
  if (!ambiguousAllergenCategories.includes(ingredientEntry.category)) return null;
  if (userAllergies && userAllergies.length > 0) {
    return {
      status: 'VERIFY',
      confidence: 'low',
      reason: ingredientEntry.description,
      verificationNote: ingredientEntry.verificationNote || 'Contact manufacturer for allergen source information.'
    };
  }
  return null;
}

/**
 * Main ingredient analysis function.
 * Parses ingredient string, matches against knowledge base, checks allergens.
 */
function analyzeIngredients(ingredientsText, userProfile) {
  const findings = [];
  const matchedIngredients = [];
  const unmatchedIngredients = [];
  const allergenFindings = [];

  if (!ingredientsText || ingredientsText.trim() === '') {
    return { findings, matchedIngredients, unmatchedIngredients, allergenFindings, missingInformation: ['No ingredient information provided.'] };
  }

  // Parse ingredient list — split by commas, semicolons, or newlines
  const rawIngredients = ingredientsText
    .split(/[,;\n]/)
    .map(i => i.trim())
    .filter(i => i.length > 0);

  const userAllergies = userProfile?.allergies || [];
  const userConditions = userProfile?.conditions || [];
  const userDietary = userProfile?.dietaryRestrictions || [];

  for (const raw of rawIngredients) {
    // Strip parenthetical content for matching (but keep for display)
    const cleanedForMatch = raw.replace(/\(.*?\)/g, '').trim();

    // --- 1. Direct allergen check ---
    const allergenMatches = checkAllergen(cleanedForMatch, userAllergies);
    if (allergenMatches.length > 0) {
      allergenFindings.push(...allergenMatches);
    }

    // --- 2. Ingredient knowledge base lookup ---
    const ingredientEntry = findIngredient(cleanedForMatch);
    if (ingredientEntry) {
      matchedIngredients.push({ original: raw, matched: ingredientEntry.key, ...ingredientEntry });

      // Check if this ingredient is relevant to user's conditions
      if (ingredientEntry.relevantFor && ingredientEntry.relevantFor.length > 0) {
        for (const relevance of ingredientEntry.relevantFor) {
          const isConditionMatch = userConditions.includes(relevance);
          const isDietaryMatch = userDietary.some(d => d === relevance || relevance === `${d}`);
          const isAllergyMatch = userAllergies.some(a => relevance === `${a}_allergy`);

          if (isConditionMatch || isDietaryMatch || isAllergyMatch) {
            // Only add if not already covered by direct allergen check
            if (!allergenFindings.some(af => af.matchedIngredient === raw)) {
              findings.push({
                ingredient: raw,
                matchedKey: ingredientEntry.key,
                category: ingredientEntry.category,
                relevantProfileFactor: relevance,
                status: ingredientEntry.riskLevel?.toUpperCase().replace('-', '_') || 'LOWER_CONCERN',
                confidence: ingredientEntry.confidence || 'medium',
                reason: ingredientEntry.description,
                evidence: 'Explicitly listed in provided ingredient information.'
              });
            }
          }
        }

        // Check for ambiguous allergen risk
        const ambiguousCheck = checkAmbiguousAllergen(ingredientEntry, userAllergies);
        if (ambiguousCheck) {
          findings.push({
            ingredient: raw,
            matchedKey: ingredientEntry.key,
            category: ingredientEntry.category,
            relevantProfileFactor: 'allergen_source_unspecified',
            status: 'VERIFY',
            confidence: 'low',
            reason: ambiguousCheck.reason,
            evidence: 'Ingredient source is not specified in label.',
            verificationNote: ambiguousCheck.verificationNote
          });
        }
      }
    } else {
      unmatchedIngredients.push(raw);
    }
  }

  const missingInformation = [];
  if (unmatchedIngredients.length > 5) {
    missingInformation.push(`${unmatchedIngredients.length} ingredients could not be matched against the knowledge base.`);
  }

  return { findings, matchedIngredients, unmatchedIngredients, allergenFindings, missingInformation };
}

module.exports = { analyzeIngredients, findIngredient, normalize };
