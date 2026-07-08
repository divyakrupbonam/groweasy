const express = require('express');
const { importLeadsStream, importLeadsSync } = require('../controllers/import.controller');
const { validateImportPayload } = require('../middleware/validateImportPayload');

const router = express.Router();

// Streaming endpoint used by the frontend (live progress).
router.post('/import', validateImportPayload, importLeadsStream);

// Non-streaming variant, handy for curl/tests/integrations.
router.post('/import-sync', validateImportPayload, importLeadsSync);

module.exports = router;
