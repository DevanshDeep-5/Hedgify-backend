const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all alerts for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const alerts = await db.query(
      `SELECT a.*, c.name as crop_name
       FROM alerts a
       JOIN crops c ON a.crop_id = c.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new alert
router.post('/', async (req, res) => {
  try {
    const { userId, cropId, alertType, thresholdPrice } = req.body;
    
    const result = await db.run(
      `INSERT INTO alerts 
       (user_id, crop_id, alert_type, threshold_price, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [userId, cropId, alertType, thresholdPrice]
    );
    
    res.json({ 
      id: result.id, 
      message: 'Alert created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle alert status
router.put('/:alertId/toggle', async (req, res) => {
  try {
    const { alertId } = req.params;
    
    await db.run(
      `UPDATE alerts 
       SET is_active = NOT is_active
       WHERE id = ?`,
      [alertId]
    );
    
    res.json({ message: 'Alert status toggled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an alert
router.delete('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    
    await db.run('DELETE FROM alerts WHERE id = ?', [alertId]);
    
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check alerts (to be called periodically)
router.get('/check', async (req, res) => {
  try {
    const activeAlerts = await db.query(
      `SELECT a.*, c.name as crop_name, ph.price as current_price
       FROM alerts a
       JOIN crops c ON a.crop_id = c.id
       LEFT JOIN (
         SELECT crop_id, price,
                ROW_NUMBER() OVER (PARTITION BY crop_id ORDER BY date DESC) as rn
         FROM price_history
       ) ph ON a.crop_id = ph.crop_id AND ph.rn = 1
       WHERE a.is_active = 1`
    );
    
    const triggeredAlerts = activeAlerts.filter(alert => {
      if (alert.alert_type === 'above' && alert.current_price >= alert.threshold_price) {
        return true;
      }
      if (alert.alert_type === 'below' && alert.current_price <= alert.threshold_price) {
        return true;
      }
      return false;
    });
    
    res.json({ 
      total: activeAlerts.length,
      triggered: triggeredAlerts.length,
      alerts: triggeredAlerts 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
