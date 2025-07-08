// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

const RESIDENT_URL = 'https://secure1.info.gov.hk/immd/mobileapps/2bb9ae17/data/CPQueueTimeR.json';
const VISITOR_URL  = 'https://secure1.info.gov.hk/immd/mobileapps/2bb9ae17/data/CPQueueTimeV.json';

app.get('/api/resident', async (req, res) => {
  try {
    const response = await fetch(RESIDENT_URL);
    const data = await response.json();
    res.set('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (err) {
    console.error('Resident API error:', err);
    res.status(500).json({ error: 'Failed to fetch resident data' });
  }
});

app.get('/api/visitor', async (req, res) => {
  try {
    const response = await fetch(VISITOR_URL);
    const data = await response.json();
    res.set('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch visitor data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
