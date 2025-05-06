const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Equity = require('./models/User');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('Mongo connection error:', err);
});

// API route to fetch users


app.get('/api/equities', async (req, res) => {
  try {
    const data = await Equity.find().limit(1951);

    const updatedData = data.map(stock => {
      const lastPrice = Number(stock?.data?.priceInfo?.lastPrice || 0);
      const issuedSize = Number(stock?.data?.securityInfo?.issuedSize || 0);
      const weekHigh52 = Number(stock?.data?.priceInfo?.weekHighLow?.max || 0);
      const weekLow52 = Number(stock?.data?.priceInfo?.weekHighLow?.min || 0);
    
      const marketCap = lastPrice * issuedSize;
      let marketCapFormatted;
      if (marketCap >= 1e7) {
        marketCapFormatted = (marketCap / 1e7).toFixed(2) + ' Cr';
      } else if (marketCap >= 1e5) {
        marketCapFormatted = (marketCap / 1e5).toFixed(2) + ' L';
      } else {
        marketCapFormatted = marketCap.toFixed(2);
      }
    
      let oneYearReturn = null;
      if (weekLow52 > 0) {
        oneYearReturn = (((lastPrice - weekLow52) / weekLow52) * 100).toFixed(2);
      }
    
      return {
        ...stock._doc,
        marketCapFormatted,
        oneYearReturn: oneYearReturn !== null ? `${oneYearReturn}%` : 'N/A',
      };
    });
    

    res.json(updatedData);
  } catch (err) {
    console.error('❌ Error fetching data:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});



  
  

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
