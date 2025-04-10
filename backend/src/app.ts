import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as path from 'path';
import { config } from 'dotenv';
import { connectDB } from './config/database';
import projectRoutes from './routes/projectRoutes';
import skillRoutes from './routes/skillRoutes';
import aboutRoutes from './routes/aboutRoutes';
import authRoutes from './routes/authRoutes';
import experienceRoutes from './routes/experienceRoutes';
import { AppError } from './utils/errorHandler';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 5000;

const isOnline = true;

// Middleware
app.use(express.json());
if (isOnline) {
  app.use(cors({
    origin: 'https://fluttersystems.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
} else {
  app.use(cors());
}



var base_route = '';

if (isOnline)
  base_route = '/portfolio';

// Routes
app.use(base_route + '/api/auth', authRoutes);
app.use(base_route + '/api/projects', projectRoutes);
app.use(base_route + '/api/skills', skillRoutes);
app.use(base_route + '/api/about', aboutRoutes);
app.use(base_route + '/api/experiences', experienceRoutes);

// --- Static File Serving (if isOnline) ---
if (isOnline) {
  const staticPath = path.resolve(__dirname, '..', '..', 'out'); // Adjust path as needed
  console.log(`Serving static files for ${base_route} from: ${staticPath}`);
  app.use(base_route, express.static(staticPath, {
     // Optional: Explicitly disable index serving by static middleware if fallback handles it
     // index: false
  }));

  // --- SPA Fallback Route (Handles client-side routes) ---
  // This MUST come AFTER API routes and static serving, but BEFORE the final 404 handler
  app.get(`${base_route}/*`, (req: Request, res: Response) => {
    const fallbackFile = path.resolve(staticPath, 'index.html');
    console.log(`SPA Fallback: Request for ${req.originalUrl}, serving index.html from: ${fallbackFile}`);
    res.sendFile(fallbackFile, (err) => {
        if (err) {
            console.error("Error sending fallback file:", err);
            res.status(500).send("Error serving application.");
        }
    });
  });
}

// Handle 404 errors
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

let server: any;

// Connect to MongoDB and start server
connectDB().then(() => {
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Closing server...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// // Serve static files
// app.use("/portfolio", express.static(path.join(__dirname, "out")));
  
// // Fallback route to serve index.html for any unmatched GET request
// app.get('*', (req: Request, res: Response) => {
//   console.log(__dirname);
//   res.sendFile(path.join(__dirname, 'out/index.html'));
// });

// Start the server
// app.listen(port, () => {
// console.log(`Server is running on http://localhost:${port}`);
// });

