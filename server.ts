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

  app.get("/api/pubmed/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    
    try {
      const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
      const searchUrl = `${baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=5`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData.esearchresult || !searchData.esearchresult.idlist) {
        return res.json({ articles: [] });
      }
      
      const ids = searchData.esearchresult.idlist.join(",");
      const summaryUrl = `${baseUrl}/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`;
      
      const summaryResponse = await fetch(summaryUrl);
      const summaryData = await summaryResponse.json();
      
      const articles = ids.split(",").map((id: string) => ({
        id,
        title: summaryData.result[id]?.title,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      }));
      
      res.json({ articles });
    } catch (error) {
      console.error("PubMed API error:", error);
      res.status(500).json({ error: "Failed to fetch from PubMed" });
    }
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
