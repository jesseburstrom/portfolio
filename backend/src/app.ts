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
  const staticPath = path.resolve(__dirname, '..', '..', 'backend', 'src', 'out'); // USE YOUR CORRECT PATH
  console.log(`Serving static files for ${base_route} from: ${staticPath}`);

  // Serve specific assets first
  app.use(`${base_route}/_next`, express.static(path.join(staticPath, '_next')));
  app.use(`${base_route}/images`, express.static(path.join(staticPath, 'images'))); // If you have a top-level images folder
  // Add other top-level static folders if needed (e.g., fonts, icons)
  app.use(`${base_route}/favicon.ico`, express.static(path.join(staticPath, 'favicon.ico')));


  // SPA Fallback - Make this catch routes that LOOK like pages, BEFORE the general 404
  app.get(`${base_route}/*`, (req: Request, res: Response, next: NextFunction) => {
      // Simple check: If the path doesn't have an extension, assume it's an SPA route
      if (path.extname(req.path)) {
           // If it has an extension but wasn't served by static above, let it 404
           return next();
      }

      const fallbackFile = path.resolve(staticPath, 'index.html');
      console.log(`SPA Fallback: Request for ${req.originalUrl}, attempting to serve index.html from: ${fallbackFile}`);
      res.sendFile(fallbackFile, (err) => {
          if (err) {
              console.error(`[${new Date().toISOString()}] Error sending fallback file for ${req.originalUrl}:`, err);
              // Pass error to global handler if file isn't found
              next(err);
          } else {
               console.log(`[${new Date().toISOString()}] Successfully sent fallback file for ${req.originalUrl}`);
          }
      });
  });
}

// if (isOnline) {
//   // Path goes from backend/dist/src up to backend/, then into src/out
//   const staticPath = path.resolve(__dirname, '..', '..', 'backend', 'src', 'out');
//   console.log(`Serving static files for ${base_route} from: ${staticPath}`);
//   // Verify this path in the logs: e.g., /home/jesse_burstrom_gmail_com/portfolio/backend/src/out
//   app.use(base_route, express.static(staticPath));

//   // --- SPA Fallback Route (Handles client-side routes) ---
//   app.get(`${base_route}/*`, (req: Request, res: Response) => {
//     // Use the same staticPath calculation
//     const fallbackFile = path.resolve(staticPath, 'index.html');
//     console.log(`SPA Fallback: Request for ${req.originalUrl}, serving index.html from: ${fallbackFile}`);
//     // Verify this path in the logs: e.g., /home/jesse_burstrom_gmail_com/portfolio/backend/src/out/index.html
//     res.sendFile(fallbackFile, (err) => {
//         if (err) {
//             console.error("Error sending fallback file:", err);
//             res.status(404).send("Application resource not found.");
//         }
//     });
//   });
// }
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

