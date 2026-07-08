const express = require('express');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');
const importRoutes = require('./routes/import.routes');
const healthRoutes = require('./routes/health.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '25mb' })); // large CSVs arrive as JSON rows

app.use('/api', healthRoutes);
app.use('/api/leads', importRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`GrowEasy CSV importer API listening on port ${config.port}`, {
    aiProvider: config.aiProvider,
  });
});
