const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all contracts for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    
    let query = `
      SELECT c.*, cr.name as crop_name, cr.unit
      FROM contracts c
      JOIN crops cr ON c.crop_id = cr.id
      WHERE c.user_id = ?
    `;
    
    const params = [userId];
    
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    const contracts = await db.query(query, params);
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new contract
router.post('/', async (req, res) => {
  try {
    const { 
      userId, 
      cropId, 
      contractType, 
      quantity, 
      strikePrice, 
      expiryDate 
    } = req.body;
    
    const entryDate = new Date().toISOString().split('T')[0];
    
    const result = await db.run(
      `INSERT INTO contracts 
       (user_id, crop_id, contract_type, quantity, strike_price, 
        current_price, entry_date, expiry_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [userId, cropId, contractType, quantity, strikePrice, strikePrice, entryDate, expiryDate]
    );
    
    // Create transaction record
    await db.run(
      `INSERT INTO transactions 
       (user_id, contract_id, transaction_type, amount, description)
       VALUES (?, ?, 'open', ?, ?)`,
      [userId, result.id, strikePrice * quantity, `Opened ${contractType} contract`]
    );
    
    res.json({ 
      id: result.id, 
      message: 'Contract created successfully',
      contractType,
      quantity,
      strikePrice
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contract (close position)
router.put('/:contractId/close', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { currentPrice } = req.body;
    
    // Get contract details
    const contract = await db.get(
      'SELECT * FROM contracts WHERE id = ?',
      [contractId]
    );
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Calculate P&L
    let pnl = 0;
    if (contract.contract_type === 'long') {
      pnl = (currentPrice - contract.strike_price) * contract.quantity;
    } else if (contract.contract_type === 'short') {
      pnl = (contract.strike_price - currentPrice) * contract.quantity;
    }
    
    // Update contract
    await db.run(
      `UPDATE contracts 
       SET status = 'closed', current_price = ?, pnl = ?
       WHERE id = ?`,
      [currentPrice, pnl, contractId]
    );
    
    // Create transaction record
    await db.run(
      `INSERT INTO transactions 
       (user_id, contract_id, transaction_type, amount, description)
       VALUES (?, ?, 'close', ?, ?)`,
      [contract.user_id, contractId, pnl, `Closed contract with P&L: ${pnl}`]
    );
    
    res.json({ 
      message: 'Contract closed successfully',
      pnl,
      currentPrice
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contract statistics for a user
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stats = await db.get(
      `SELECT 
         COUNT(*) as total_contracts,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_contracts,
         SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_contracts,
         COALESCE(SUM(CASE WHEN status = 'closed' THEN pnl ELSE 0 END), 0) as total_pnl,
         COALESCE(AVG(CASE WHEN status = 'closed' THEN pnl ELSE NULL END), 0) as avg_pnl
       FROM contracts
       WHERE user_id = ?`,
      [userId]
    );
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
