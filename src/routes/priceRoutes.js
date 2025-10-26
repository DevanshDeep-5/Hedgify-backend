const express = require('express');
const router = express.Router();
const db = require('../config/database');
const predictionService = require('../services/predictionService');

// Get all crops
router.get('/crops', async (req, res) => {
  try {
    const crops = await db.query('SELECT * FROM crops');
    res.json(crops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get price history for a crop
router.get('/history/:cropId', async (req, res) => {
  try {
    const { cropId } = req.params;
    const { limit = 30 } = req.query;
    
    const prices = await db.query(
      `SELECT ph.*, c.name as crop_name 
       FROM price_history ph
       JOIN crops c ON ph.crop_id = c.id
       WHERE ph.crop_id = ?
       ORDER BY ph.date DESC
       LIMIT ?`,
      [cropId, limit]
    );
    
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current prices for all crops
router.get('/current', async (req, res) => {
  try {
    const prices = await db.query(
      `SELECT c.id, c.name, c.category, ph.price, ph.date, ph.market
       FROM crops c
       LEFT JOIN (
         SELECT crop_id, price, date, market,
                ROW_NUMBER() OVER (PARTITION BY crop_id ORDER BY date DESC) as rn
         FROM price_history
       ) ph ON c.id = ph.crop_id AND ph.rn = 1
       ORDER BY c.name`
    );
    
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get price prediction
router.get('/predict/:cropId', async (req, res) => {
  try {
    const { cropId } = req.params;
    const { days = 7 } = req.query;
    
    const prediction = await predictionService.predictPrice(cropId, parseInt(days));
    
    if (prediction.error) {
      return res.status(400).json(prediction);
    }
    
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get volatility for a crop
router.get('/volatility/:cropId', async (req, res) => {
  try {
    const { cropId } = req.params;
    const volatility = await predictionService.calculateVolatility(cropId);
    
    res.json({ cropId, volatility });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
