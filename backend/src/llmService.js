/**
 * LLM SERVICE
 *
 * This layer provides explanations and conversational Q&A ONLY.
 * It does NOT classify risk — the rule engine does that.
 * It receives structured findings and explains them in plain language.
 */

const https = require('https');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Makes a request to the Gemini API.
 */
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: 'GEMINI_API_KEY not configured. LLM explanations unavailable.' };
  }

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 800
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
    ]
  });

  return new Promise((resolve, reject) => {
    const url = `${GEMINI_API_URL}?key=${apiKey}`;
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          resolve({ text: text || 'No explanation available.' });
        } catch (e) {
          resolve({ text: 'Could not parse LLM response.' });
        }
      });
    });

    req.on('error', () => resolve({ text: 'LLM service temporarily unavailable.' }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ text: 'LLM request timed out.' });
    });
    req.write(body);
    req.end();
  });
}

/**
 * Generates a plain-language explanation of the structured risk result.
 * The LLM explains findings — it does NOT reclassify risk.
 */
async function generateExplanation(riskResult, foodName, userProfile) {
  const { overallStatus, allergenFindings, ingredientFindings, nutritionFindings } = riskResult;

  const conditions = (userProfile?.conditions || []).join(', ') || 'none declared';
  const allergies = (userProfile?.allergies || []).join(', ') || 'none declared';

  const findingsSummary = [
    ...allergenFindings.map(f => `- ALLERGEN: ${f.matchedIngredient} detected (${f.allergenName} allergen)`),
    ...ingredientFindings.slice(0, 5).map(f => `- INGREDIENT: ${f.ingredient} (${f.category}) → relevant to ${f.relevantProfileFactor}, confidence: ${f.confidence}`),
    ...nutritionFindings.slice(0, 4).map(f => `- NUTRITION: ${f.nutrient} = ${f.value}${f.unit} (threshold ${f.threshold}${f.unit} for ${f.conditionName})`)
  ].join('\n');

  const prompt = `You are NutriShield, a personalized food risk intelligence assistant. You help users understand food safety based on their specific health profile.

IMPORTANT RULES:
- You explain the structured findings below. You do NOT reclassify risk.
- Use careful, non-alarming language. Say "may be relevant", "consider", "caution" — not "dangerous" or "will harm".
- Do NOT diagnose conditions or prescribe treatment.
- Do NOT claim the food is universally safe or unsafe.
- Keep response under 150 words.

USER PROFILE:
- Health conditions: ${conditions}
- Allergies: ${allergies}

FOOD ANALYZED: ${foodName}
OVERALL STATUS DETERMINED BY RULE ENGINE: ${overallStatus}

STRUCTURED FINDINGS:
${findingsSummary || 'No specific concerns detected for this profile.'}

Generate a brief, plain-language explanation of why this food received its risk classification. Focus on what the user should know and consider.`;

  const result = await callGemini(prompt);
  return result.text || generateFallbackExplanation(riskResult, foodName, userProfile);
}

/**
 * Answers a follow-up chatbot question about the current food analysis.
 */
async function answerChatQuestion(question, riskResult, foodName, userProfile) {
  const { overallStatus, allergenFindings, ingredientFindings, nutritionFindings, nutritionSummary } = riskResult;

  const findingsSummary = [
    ...allergenFindings.map(f => `- ${f.matchedIngredient}: ${f.allergenName} allergen, HIGH RISK`),
    ...ingredientFindings.slice(0, 5).map(f => `- ${f.ingredient}: ${f.reason}`),
    ...nutritionFindings.slice(0, 4).map(f => `- ${f.nutrient}: ${f.value}${f.unit} (${f.reason})`)
  ].join('\n') || 'No specific findings for this profile.';

  const conditions = (userProfile?.conditions || []).join(', ') || 'none';
  const allergies = (userProfile?.allergies || []).join(', ') || 'none';

  const prompt = `You are NutriShield, a personalized food risk intelligence assistant. Answer the user's question based ONLY on the structured analysis below.

RULES:
- Base your answer on the structured findings only. Do NOT invent information.
- Use careful language: "may", "consider", "based on available information".
- Do NOT diagnose or prescribe treatment.
- Do NOT claim food is universally safe or dangerous.
- Be concise — under 120 words.
- If you don't know, say so honestly.

USER PROFILE: Conditions: ${conditions} | Allergies: ${allergies}
FOOD: ${foodName} | OVERALL STATUS: ${overallStatus}

STRUCTURED FINDINGS:
${findingsSummary}

USER'S QUESTION: "${question}"

Answer:`;

  const result = await callGemini(prompt);
  return result.text || generateFallbackAnswer(question, riskResult);
}

/**
 * Fallback explanation when LLM is unavailable.
 */
function generateFallbackExplanation(riskResult, foodName, userProfile) {
  const { overallStatus, allergenFindings, ingredientFindings, nutritionFindings } = riskResult;

  if (overallStatus === 'HIGH_RISK' && allergenFindings.length > 0) {
    const allergen = allergenFindings[0].allergenName;
    return `${foodName} contains ${allergenFindings[0].matchedIngredient}, which is a ${allergen} allergen. Based on your declared allergy, this has been classified as HIGH RISK. Please avoid this product or verify with the manufacturer.`;
  }

  if (overallStatus === 'CAUTION') {
    const concerns = [...ingredientFindings, ...nutritionFindings].slice(0, 2).map(f => f.ingredient || f.nutrient).join(' and ');
    return `${foodName} has been flagged as CAUTION based on your profile. Relevant concerns include ${concerns || 'ingredients or nutrients'}. Review the details below and consider consulting your healthcare provider.`;
  }

  if (overallStatus === 'VERIFY') {
    return `${foodName} contains ingredients with unspecified sources. Based on your declared profile, verification is recommended before consuming this product.`;
  }

  return `Based on the information available and your declared profile, no relevant conflicts were detected in ${foodName}. This does not guarantee the food is universally safe.`;
}

function generateFallbackAnswer(question, riskResult) {
  return `Based on the structured analysis, the overall risk for this food is ${riskResult.overallStatus}. ${riskResult.limitations?.[0] || ''} For specific medical advice, please consult a qualified healthcare professional.`;
}

module.exports = { generateExplanation, answerChatQuestion };
