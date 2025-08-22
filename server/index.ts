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

  // For development - serve a simple functional React app
  app.get("*", (req, res) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    // Serve a working React app HTML
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI Community Portal</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px 0; margin-bottom: 20px; }
          .nav { display: flex; gap: 20px; margin-top: 10px; }
          .nav a { color: white; text-decoration: none; padding: 8px 16px; border-radius: 4px; }
          .nav a:hover { background: rgba(255,255,255,0.1); }
          .hero { text-align: center; padding: 40px 0; background: #f8fafc; margin-bottom: 20px; border-radius: 8px; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
          .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
          .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
          .tool-card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
          .tool-card img { width: 100%; height: 160px; object-fit: cover; background: #f1f5f9; }
          .tool-card-content { padding: 16px; }
          .tool-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
          .tool-description { color: #64748b; font-size: 14px; line-height: 1.4; }
          .loading { text-align: center; padding: 40px; color: #64748b; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        
        <script type="text/babel">
          const { useState, useEffect } = React;
          
          function App() {
            const [tools, setTools] = useState([]);
            const [loading, setLoading] = useState(true);
            const [stats, setStats] = useState({ toolsCount: 0, usersCount: 0 });
            
            useEffect(() => {
              // Fetch tools and stats
              Promise.all([
                fetch('/api/tools').then(r => r.ok ? r.json() : []),
                fetch('/api/stats').then(r => r.ok ? r.json() : {})
              ]).then(([toolsData, statsData]) => {
                setTools(toolsData || []);
                setStats(statsData || {});
                setLoading(false);
              }).catch(() => {
                setLoading(false);
              });
            }, []);
            
            if (loading) {
              return (
                <div>
                  <div className="header">
                    <div className="container">
                      <h1>AI Community Portal</h1>
                      <div className="nav">
                        <a href="/">Home</a>
                        <a href="/tools">Tools</a>
                        <a href="/prompts">Prompts</a>
                        <a href="/courses">Courses</a>
                        <a href="/jobs">Jobs</a>
                        <a href="/news">News</a>
                      </div>
                    </div>
                  </div>
                  <div className="container">
                    <div className="loading">Loading your AI community...</div>
                  </div>
                </div>
              );
            }
            
            return (
              <div>
                <div className="header">
                  <div className="container">
                    <h1>AI Community Portal</h1>
                    <p>Discover the best AI tools, prompts, courses, and more</p>
                    <div className="nav">
                      <a href="/">Home</a>
                      <a href="/tools">Tools</a>
                      <a href="/prompts">Prompts</a>
                      <a href="/courses">Courses</a>
                      <a href="/jobs">Jobs</a>
                      <a href="/news">News</a>
                    </div>
                  </div>
                </div>
                
                <div className="container">
                  <div className="hero">
                    <h2>Welcome to AI Community Portal</h2>
                    <p>Your one-stop destination for AI tools and resources</p>
                  </div>
                  
                  <div className="stats">
                    <div className="stat-card">
                      <h3>{stats.toolsCount || 0}</h3>
                      <p>AI Tools</p>
                    </div>
                    <div className="stat-card">
                      <h3>{stats.usersCount || 0}</h3>
                      <p>Community Members</p>
                    </div>
                    <div className="stat-card">
                      <h3>{stats.promptsCount || 0}</h3>
                      <p>Prompts</p>
                    </div>
                    <div className="stat-card">
                      <h3>{stats.coursesCount || 0}</h3>
                      <p>Courses</p>
                    </div>
                  </div>
                  
                  <h2 style={{marginBottom: '20px'}}>Featured AI Tools</h2>
                  <div className="tools-grid">
                    {tools.slice(0, 6).map(tool => (
                      <div key={tool.id} className="tool-card">
                        <img src={tool.logoUrl || '/api/placeholder/300/160'} alt={tool.name} />
                        <div className="tool-card-content">
                          <div className="tool-title">{tool.name}</div>
                          <div className="tool-description">{tool.shortDescription || tool.description?.substring(0, 100) + '...'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {tools.length === 0 && (
                    <div className="loading">
                      <p>No tools found. Your backend is running, but the database might be empty.</p>
                      <p>API Status: Backend Connected ✅</p>
                    </div>
                  )}
                </div>
              </div>
            );
          }
          
          ReactDOM.render(<App />, document.getElementById('root'));
        </script>
      </body>
      </html>
    `);
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