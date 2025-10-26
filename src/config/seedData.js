const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/hedging.db');
const db = new sqlite3.Database(dbPath);

const crops = [
  { name: 'Soybean', category: 'oilseed', unit: 'quintal' },
  { name: 'Mustard', category: 'oilseed', unit: 'quintal' },
  { name: 'Groundnut', category: 'oilseed', unit: 'quintal' },
  { name: 'Sunflower', category: 'oilseed', unit: 'quintal' }
];

// Generate realistic price data for the last 60 days
function generatePriceHistory(basePrice, cropId, volatility = 0.03) {
  const prices = [];
  const today = new Date();
  let currentPrice = basePrice;
  
  for (let i = 60; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Add some random walk with trend
    const change = (Math.random() - 0.48) * volatility * currentPrice;
    currentPrice = Math.max(basePrice * 0.7, currentPrice + change);
    
    prices.push({
      crop_id: cropId,
      price: Math.round(currentPrice * 100) / 100,
      date: dateStr,
      market: 'NCDEX'
    });
  }
  
  return prices;
}

// Base prices for crops (per quintal in INR)
const basePrices = {
  'Soybean': 4500,
  'Mustard': 5200,
  'Groundnut': 5800,
  'Sunflower': 6500
};

db.serialize(() => {
  console.log('Seeding crops...');
  
  // Insert crops
  const cropIds = {};
  crops.forEach((crop, index) => {
    db.run(
      'INSERT INTO crops (name, category, unit) VALUES (?, ?, ?)',
      [crop.name, crop.category, crop.unit],
      function(err) {
        if (err) {
          console.error(`Error inserting ${crop.name}:`, err.message);
        } else {
          cropIds[crop.name] = this.lastID;
          console.log(`✓ Inserted ${crop.name} (ID: ${this.lastID})`);
          
          // Generate and insert price history
          const prices = generatePriceHistory(basePrices[crop.name], this.lastID);
          
          prices.forEach(price => {
            db.run(
              'INSERT INTO price_history (crop_id, price, date, market) VALUES (?, ?, ?, ?)',
              [price.crop_id, price.price, price.date, price.market]
            );
          });
          
          console.log(`✓ Inserted ${prices.length} price records for ${crop.name}`);
        }
      }
    );
  });
  
  // Create a demo user
  const bcrypt = require('bcryptjs');
  const demoPassword = bcrypt.hashSync('demo123', 10);
  
  db.run(
    `INSERT INTO users (name, email, password, phone, user_type) 
     VALUES (?, ?, ?, ?, ?)`,
    ['Demo Farmer', 'demo@farmer.com', demoPassword, '9876543210', 'farmer'],
    function(err) {
      if (err) {
        console.error('Error creating demo user:', err.message);
      } else {
        console.log('✓ Created demo user (ID: ' + this.lastID + ')');
        console.log('  Email: demo@farmer.com');
        console.log('  Password: demo123');
      }
    }
  );
  
  console.log('\n✅ Database seeded successfully!');
  console.log('You can now start the server and test the application.\n');
});

db.close();
