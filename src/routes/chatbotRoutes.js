const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbotService');

// Chat endpoint - send message and get response
router.post('/chat', async (req, res) => {
  try {
    const { message, language, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await chatbotService.chat(
      message,
      language || 'en',
      userId || null
    );
    
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get supported languages
router.get('/languages', (req, res) => {
  res.json({
    languages: [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
      { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
      { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
      { code: 'bn', name: 'Bengali', native: 'বাংলা' },
      { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' }
    ]
  });
});

module.exports = router;
