const db = require('../config/database');

class PredictionService {
  // Calculate Simple Moving Average
  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  // Calculate Exponential Moving Average
  calculateEMA(prices, period) {
    if (prices.length < period) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((acc, price) => acc + price, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  // Calculate trend using linear regression
  calculateTrend(prices) {
    const n = prices.length;
    if (n < 2) return 0;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += prices[i];
      sumXY += i * prices[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  // Predict next day price
  async predictPrice(cropId, days = 7) {
    try {
      // Get historical prices (last 30 days)
      const priceHistory = await db.query(
        `SELECT price, date FROM price_history 
         WHERE crop_id = ? 
         ORDER BY date DESC 
         LIMIT 30`,
        [cropId]
      );

      if (priceHistory.length < 10) {
        return { error: 'Insufficient data for prediction' };
      }

      const prices = priceHistory.map(p => p.price).reverse();
      
      // Calculate indicators
      const sma7 = this.calculateSMA(prices, 7);
      const sma14 = this.calculateSMA(prices, 14);
      const ema7 = this.calculateEMA(prices, 7);
      const trend = this.calculateTrend(prices);
      
      const currentPrice = prices[prices.length - 1];
      
      // Simple prediction model (weighted average)
      const predictions = [];
      let lastPrice = currentPrice;
      
      for (let i = 1; i <= days; i++) {
        // Combine multiple factors for prediction
        const trendComponent = lastPrice + (trend * i);
        const emaComponent = ema7 * 1.1; // Slight weight to EMA
        const smaComponent = (sma7 + sma14) / 2;
        
        // Weighted prediction
        const predictedPrice = (
          trendComponent * 0.4 + 
          emaComponent * 0.3 + 
          smaComponent * 0.3
        );
        
        predictions.push({
          day: i,
          price: Math.round(predictedPrice * 100) / 100,
          confidence: Math.max(0.5, 1 - (i * 0.05)) // Confidence decreases with time
        });
        
        lastPrice = predictedPrice;
      }

      return {
        currentPrice,
        predictions,
        indicators: {
          sma7: Math.round(sma7 * 100) / 100,
          sma14: Math.round(sma14 * 100) / 100,
          ema7: Math.round(ema7 * 100) / 100,
          trend: trend > 0 ? 'upward' : 'downward',
          trendStrength: Math.abs(trend)
        }
      };
    } catch (error) {
      console.error('Prediction error:', error);
      return { error: 'Failed to generate prediction' };
    }
  }

  // Calculate volatility
  async calculateVolatility(cropId, period = 30) {
    try {
      const priceHistory = await db.query(
        `SELECT price FROM price_history 
         WHERE crop_id = ? 
         ORDER BY date DESC 
         LIMIT ?`,
        [cropId, period]
      );

      if (priceHistory.length < 2) {
        return 0;
      }

      const prices = priceHistory.map(p => p.price);
      const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
      
      const variance = prices.reduce((acc, price) => {
        return acc + Math.pow(price - mean, 2);
      }, 0) / prices.length;
      
      return Math.sqrt(variance);
    } catch (error) {
      console.error('Volatility calculation error:', error);
      return 0;
    }
  }
}

module.exports = new PredictionService();
