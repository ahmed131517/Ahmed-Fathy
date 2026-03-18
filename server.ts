import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const settingsFilePath = path.join(process.cwd(), 'settings.json');

  // API routes
  app.get("/api/settings", (req, res) => {
    if (fs.existsSync(settingsFilePath)) {
      const settings = fs.readFileSync(settingsFilePath, 'utf-8');
      res.json(JSON.parse(settings));
    } else {
      res.json({});
    }
  });

  app.post("/api/settings", (req, res) => {
    const settings = req.body;
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
    res.json({ status: "success" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
