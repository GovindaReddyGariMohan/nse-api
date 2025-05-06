const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxies = [
  'http://185.199.229.156:7492',
  'http://51.159.115.233:3128',
  'http://103.127.1.130:80',
  'http://47.243.180.142:808',
  'http://80.48.119.28:8080'
];

const fetchNSEHomepage = async () => {
  for (const proxy of proxies) {
    try {
      console.log(`🔄 Trying proxy: ${proxy}`);
      const agent = new HttpsProxyAgent(proxy);

      const response = await axios.get('https://www.nseindia.com', {
        httpsAgent: agent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 10000,
      });

      console.log('✅ Connected to NSE successfully using proxy:', proxy);
      return; // exit after successful connection

    } catch (err) {
      console.error(`❌ Failed with proxy ${proxy}:`, err.code || err.message);
    }
  }

  console.log('❌ All proxies failed. Try running from cloud or update proxy list.');
};

fetchNSEHomepage();
