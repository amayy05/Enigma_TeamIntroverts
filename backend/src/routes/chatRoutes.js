const express = require('express');
const router = express.Router();
const { answerChatQuestion } = require('../llmService');

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { question, riskResult, foodName, profile } = req.body;

    if (!question || !riskResult) {
      return res.status(400).json({ error: 'Question and risk result are required.' });
    }

    const answer = await answerChatQuestion(question, riskResult, foodName || 'this food', profile || {});

    res.json({
      success: true,
      question,
      answer,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat service unavailable. Please try again.' });
  }
});

module.exports = router;
