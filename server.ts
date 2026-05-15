import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

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

  app.post("/api/ai/chat", async (req, res) => {
    const { messages, provider, model, apiKey, systemInstruction } = req.body;

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured on server" });
      }
      try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Convert messages to Gemini format with flexible role matching
        const contents = messages.map((m: any) => ({
          role: ['model', 'ai', 'assistant', 'assistant'].includes(m.role?.toLowerCase()) ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const result = await genAI.models.generateContent({ 
          model: model || 'gemini-1.5-flash',
          contents,
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
        } as any);
        
        res.json({ content: result.text || "" });
      } catch (error) {
        console.error("Gemini server error:", error);
        res.status(500).json({ error: "Gemini processing failed" });
      }
    } else if (provider === 'openrouter') {
      const orApiKey = apiKey || process.env.OPENROUTER_API_KEY;
      if (!orApiKey) {
        return res.status(400).json({ error: "OpenRouter API key is missing" });
      }

      try {
        const normalizedMessages = messages.map((m: any) => ({
          role: ['model', 'ai', 'assistant'].includes(m.role?.toLowerCase()) ? 'assistant' : 'user',
          content: m.content
        }));

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${orApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
            "X-Title": "AI Studio Clinical Portal"
          },
          body: JSON.stringify({
            model: model || "openai/gpt-4o-mini",
            messages: [
              ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
              ...normalizedMessages
            ]
          })
        });

        const data = await response.json();
        if (data.error) {
          return res.status(500).json({ error: data.error.message || "OpenRouter error" });
        }
        res.json({ content: data.choices?.[0]?.message?.content || "" });
      } catch (error) {
        console.error("OpenRouter server error:", error);
        res.status(500).json({ error: "OpenRouter processing failed" });
      }
    } else {
      res.status(400).json({ error: "Invalid AI provider" });
    }
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
