import express from 'express';
import { photoRoutes } from './routes/photoRoutes';
import { errorHandler } from './middleware/errorHandler';
import path from 'path';
import fs from 'fs';

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

// Determine public directory path (works for both src/ and dist/)
const getPublicPath = (): string => {
  // Check if we're in dist/ (compiled) or src/ (dev/test)
  const distPublic = path.join(__dirname, 'public');
  if (fs.existsSync(distPublic)) {
    return distPublic;
  }
  // Fall back to project root /public for dev/test
  return path.join(__dirname, '..', 'public');
};

const publicPath = getPublicPath();

// API routes must come BEFORE static files and catch-all
photoRoutes(app);

// Serve static files from the public directory
app.use(express.static(publicPath));
app.use('/styles', express.static(path.join(publicPath, 'styles')));
app.use('/images', express.static(path.join(publicPath, 'images')));

// Catch-all route to serve the main index.html file (must be last)
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
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
