import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Set proper MIME types for TypeScript and JavaScript modules
  express.static.mime.define({
    'text/javascript': ['tsx', 'ts', 'jsx', 'js'],
    'application/javascript': ['tsx', 'ts', 'jsx', 'js']
  });


  // Serve client files
  app.use(express.static(path.resolve(process.cwd(), 'client')));
  
  // Special handling for TypeScript files
  app.get('/src/*.tsx', (req, res) => {
    const filePath = path.join(process.cwd(), 'client', req.path);
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(filePath);
  });
  
  app.get('/src/*.ts', (req, res) => {
    const filePath = path.join(process.cwd(), 'client', req.path);
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(filePath);
  });
  
  app.use('/src', express.static(path.resolve(process.cwd(), 'client/src')));
  app.use('/node_modules', express.static(path.resolve(process.cwd(), 'node_modules')));
  
  // Handle all other routes - serve the React app
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    const htmlPath = path.resolve(process.cwd(), 'client/index.html');
    res.sendFile(htmlPath);
  });

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📡 API available at http://localhost:${port}/api/`);
  });
})();