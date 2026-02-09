import express from 'express';
import { photoRoutes } from './routes/photoRoutes';
import { errorHandler } from './middleware/errorHandler';
import path from 'path';

// Validate environment variables
const validateEnv = (): void => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const validEnvs = ['development', 'production', 'test'];

  if (!validEnvs.includes(nodeEnv)) {
    throw new Error(
      `Invalid NODE_ENV: ${nodeEnv}. Must be one of: ${validEnvs.join(', ')}`
    );
  }
};

validateEnv();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/styles', express.static(path.join(__dirname, 'public/styles')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Use the photo routes
photoRoutes(app);

// Catch-all route to serve the main index.html file
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    // Server started (logging will be added in Phase 6)
  });
}

export default app;
