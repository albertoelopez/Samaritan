import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import passport from './config/passport';
import { config } from './config/environment';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import { loggerStream } from './utils/logger';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.isProduction ? undefined : false,
}));

// CORS
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (!config.isTest) {
  app.use(morgan('combined', { stream: loggerStream }));
}

// Rate limiting
app.use(generalLimiter);

// Passport initialization
app.use(passport.initialize());

// API routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'HomeDepot Paisano API',
    version: '1.0.0',
    status: 'running',
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
