const express = require('express');
const router = express.Router();

// In-memory profile store
let currentProfile = {
  conditions: [],
  allergies: [],
  dietaryRestrictions: [],
  name: 'User'
};

// GET /api/profile
router.get('/', (req, res) => {
  res.json({ profile: currentProfile });
});

// POST /api/profile
router.post('/', (req, res) => {
  const { conditions, allergies, dietaryRestrictions, name } = req.body;

  const validConditions = ['diabetes', 'ckd', 'hypertension', 'pcos'];
  const validAllergies = ['peanut_allergy', 'milk_allergy', 'soy_allergy', 'wheat_allergy', 'tree_nut_allergy'];
  const validDietary = ['vegetarian', 'vegan', 'gluten_free', 'low_sodium', 'low_sugar'];

  currentProfile = {
    name: name || 'User',
    conditions: (conditions || []).filter(c => validConditions.includes(c)),
    allergies: (allergies || []).filter(a => validAllergies.includes(a)),
    dietaryRestrictions: (dietaryRestrictions || []).filter(d => validDietary.includes(d))
  };

  res.json({ success: true, profile: currentProfile });
});

module.exports = router;
