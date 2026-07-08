const express = require('express');
const config = require('../config');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', aiProvider: config.aiProvider, time: new Date().toISOString() });
});

module.exports = router;
