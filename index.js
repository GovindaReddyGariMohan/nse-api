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

// API route to fetch equities and calculate Market Cap in Lakhs or Crores
app.get('/api/equities', async (req, res) => {
  try {
    // Fetch data from MongoDB
    const data = await Equity.find().limit(2068);

    // Calculate market cap for each equity and convert to Lakhs or Crores
    const updatedData = data.map(stock => {
      const lastPrice = stock?.data?.priceInfo?.lastPrice || 0;  // Last price of the stock
      const issuedSize = stock?.data?.securityInfo?.issuedSize || 0;  // Issued size (total number of shares)

      // Calculate Market Cap
      const marketCap = lastPrice * issuedSize;

      // Determine whether to display in Lakhs or Crores
      let marketCapFormatted;
      if (marketCap >= 1e7) {  // Market cap >= 1 crore (10 million)
        marketCapFormatted = (marketCap / 1e7).toFixed(2) + ' Cr';  // In Crores
      } else if (marketCap >= 1e5) {  // Market cap >= 1 lakh (100,000)
        marketCapFormatted = (marketCap / 1e5).toFixed(2) + ' L';  // In Lakhs
      } else {
        marketCapFormatted = marketCap.toFixed(2);  // If it's smaller than a lakh, show the raw number
      }

      // Return the updated stock data including the market cap
      return {
        ...stock._doc,  // Spread the original stock data
        marketCapFormatted  // Adding the formatted market cap
      };
    });

    // Send the updated data with market cap formatted
    res.json(updatedData);
  } catch (err) {
    console.error('❌ Error fetching data:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/equities/:id', async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const equity = await Equity.findById(id);

    if (!equity) {
      return res.status(404).json({ message: 'Equity not found' });
    }

    // Calculate market cap
    const lastPrice = equity?.data?.priceInfo?.lastPrice || 0;
    const issuedSize = equity?.data?.securityInfo?.issuedSize || 0;
    const marketCap = lastPrice * issuedSize;

    let marketCapFormatted;
    if (marketCap >= 1e7) {
      marketCapFormatted = (marketCap / 1e7).toFixed(2) + ' Cr';
    } else if (marketCap >= 1e5) {
      marketCapFormatted = (marketCap / 1e5).toFixed(2) + ' L';
    } else {
      marketCapFormatted = marketCap.toFixed(2);
    }

    res.json({ item: equity, marketCapFormatted });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});






app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
