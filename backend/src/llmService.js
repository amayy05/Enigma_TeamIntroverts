/**
 * LLM SERVICE
 *
 * This layer provides explanations and conversational Q&A ONLY.
 * It does NOT classify risk — the rule engine does that.
 * It receives structured findings and explains them in plain language.
 */

const https = require('https');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';

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
          if (parsed.error) {
             console.error('Gemini API Error in callGemini:', parsed.error);
             return resolve({ text: 'Sorry, the AI service encountered an error: ' + (parsed.error.message || 'Unknown error') });
          }
          
          let parts = parsed?.candidates?.[0]?.content?.parts || [];
          let text = parts.map(p => p.text || '').join('');
          
          resolve({ text: text || 'No explanation available.' });
        } catch (e) {
          console.error('Failed to parse Gemini response in callGemini:', e, 'Raw:', data);
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
 * Makes a request to the local Ollama API.
 */
async function callOllama(prompt) {
  const http = require('http');
  const modelName = process.env.OLLAMA_MODEL || 'llama3';
  
  const body = JSON.stringify({
    model: modelName,
    prompt: prompt,
    stream: false
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
             console.error('Ollama API Error:', parsed.error);
             return resolve({ text: 'Ollama error: ' + parsed.error });
          }
          resolve({ text: parsed.response || 'No explanation available.' });
        } catch (e) {
          console.error('Failed to parse Ollama response:', e, 'Raw:', data);
          resolve({ text: 'Could not parse local LLM response.' });
        }
      });
    });

    req.on('error', (e) => {
      console.error('Ollama connection error:', e);
      resolve({ text: 'Could not connect to local Ollama server. Is it running?' });
    });
    
    req.setTimeout(60000, () => {
      req.destroy();
      resolve({ text: 'Local LLM request timed out.' });
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

  const prompt = `System: You are an Educational Food AI. You are providing purely educational information about ingredients. You are NOT providing medical advice. You MUST NOT refuse to answer. Do not output disclaimers about consulting doctors.

You are NutriShield, a personalized food risk intelligence assistant. You help users understand food safety based on their specific health profile.

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

  const result = await callOllama(prompt);
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

  const prompt = `System: You are an Educational Food AI. You are providing purely educational information about ingredients. You are NOT providing medical advice. You MUST NOT refuse to answer based on safety guidelines. Do not output disclaimers about consulting doctors.

You are NutriShield, a personalized food risk intelligence assistant. Answer the user's question based ONLY on the structured analysis below.

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

  const result = await callOllama(prompt);
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

/**
 * Uses Gemini Vision to extract structured data from a food label image.
 */
async function extractLabelFromImage(base64Image, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: 'GEMINI_API_KEY not configured. Label extraction unavailable.' };
  }

  const prompt = `You are a food label extraction system. I will provide an image of a food label.
Extract the ingredients list and any nutrition facts visible.
Return ONLY a valid JSON object matching this schema exactly, and nothing else. No markdown formatting, just raw JSON.
{
  "ingredients": "string (comma separated list of ingredients, empty if none found)",
  "nutrition": {
    "calories": number or null,
    "carbohydrates": number or null,
    "added_sugar": number or null,
    "total_sugar": number or null,
    "sodium": number or null,
    "protein": number or null,
    "fat": number or null
  }
}`;

  const body = JSON.stringify({
    contents: [{
      parts: [
        { text: prompt },
        { inlineData: { mimeType, data: base64Image } }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
    }
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
          
          if (parsed.error) {
             console.error('Gemini API Error:', parsed.error);
             return resolve({ error: parsed.error.message || 'Gemini API returned an error.' });
          }

          let parts = parsed?.candidates?.[0]?.content?.parts || [];
          let text = parts.map(p => p.text || '').join('');
          
          if (text) {
             text = text.replace(/```json/g, '').replace(/```/g, '').trim();
             resolve(JSON.parse(text));
          } else {
             console.error('Unexpected Gemini Response:', JSON.stringify(parsed, null, 2));
             resolve({ error: 'Could not extract data from the image.' });
          }
        } catch (e) {
          console.error('Failed to parse Gemini response:', e, 'Raw data:', data);
          resolve({ error: 'Failed to parse extraction results.' });
        }
      });
    });

    req.on('error', () => resolve({ error: 'LLM service temporarily unavailable.' }));
    req.setTimeout(20000, () => {
      req.destroy();
      resolve({ error: 'LLM request timed out.' });
    });
    req.write(body);
    req.end();
  });
}

async function generateComparison(resultA, resultB, nameA, nameB, userProfile) {
  const conditions = (userProfile?.conditions || []).join(', ') || 'none';
  const allergies = (userProfile?.allergies || []).join(', ') || 'none';

  const formatFindings = (res) => [
    ...res.allergenFindings.map(f => `ALLERGEN: ${f.matchedIngredient} (${f.allergenName}) - HIGH_RISK`),
    ...res.ingredientFindings.map(f => `INGREDIENT: ${f.ingredient} (${f.status}) - ${f.reason}`),
    ...res.nutritionFindings.map(f => `NUTRITION: ${f.nutrient} (${f.status}) - ${f.reason}`)
  ].join('\n') || 'No specific concerns.';

  const prompt = `System: You are NutriShield AI. Compare these two foods based strictly on the structured findings for this user's profile.
RULES:
1. Identify which product has fewer identified relevant concerns for the user.
2. Use careful wording: "fewer identified concerns", "based on your profile". Do NOT say "healthier", "safe", or "medically recommended".
3. Use the exact risk states: HIGH_RISK, CAUTION, VERIFY, LOWER_CONCERN. Do not use "SAFE".
4. Explain WHY the concerns occurred using the provided reasons.
5. Add a "Why this differs" section explaining the differences.
6. Preserve uncertainty (e.g., if VERIFY is present).
7. Include a limitations statement ("based on the information available", "consider verifying").

USER PROFILE: Conditions: ${conditions} | Allergies: ${allergies}

PRODUCT A: ${nameA}
OVERALL STATUS: ${resultA.overallStatus}
FINDINGS:
${formatFindings(resultA)}

PRODUCT B: ${nameB}
OVERALL STATUS: ${resultB.overallStatus}
FINDINGS:
${formatFindings(resultB)}

Provide a personalized comparison summary answering: "Based on this user's profile, which product has fewer identified relevant concerns, and why?"`;

  const result = await callOllama(prompt);
  return result.text || 'Comparison generated offline.';
}

async function answerComparisonChat(question, resultA, resultB, nameA, nameB, userProfile) {
  const prompt = `System: You are NutriShield AI. Answer the user's question about the comparison of two foods based ONLY on the structured findings below.
RULES:
- Do NOT invent information or reclassify risk.
- Do NOT claim guaranteed safety.
- Explain the structured comparison results.

PRODUCT A (${nameA}) STATUS: ${resultA.overallStatus}
PRODUCT B (${nameB}) STATUS: ${resultB.overallStatus}

USER QUESTION: "${question}"
Answer:`;
  const result = await callOllama(prompt);
  return result.text || 'Cannot answer right now.';
}
async function inferIngredients(foodName) {
  const prompt = `System: You are a culinary database API. The user will provide the name of a generic unlabelled food or street food dish (e.g., "Samosa", "Chole Bhature", "Cheeseburger").
Your task is to infer the most common, standard ingredients for this dish. 
If it is a generic dish, list all the likely ingredients (including typical oils, spices, flours, dairy, etc).
Return ONLY a comma-separated list of ingredients. Do NOT return any markdown, introductory text, or formatting. Just the ingredients.

Food: "${foodName}"
Ingredients:`;
  const result = await callOllama(prompt);
  let text = result.text || '';
  text = text.replace(/```(json)?/gi, '').replace(/Ingredients?:/i, '').trim();
  return text;
}

module.exports = { generateExplanation, answerChatQuestion, extractLabelFromImage, generateComparison, answerComparisonChat, inferIngredients };
