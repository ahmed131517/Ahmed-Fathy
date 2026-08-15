import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";
import helmet from "helmet";
import { z } from "zod";

dotenv.config();

// Custom in-memory rate limiter to secure expensive AI endpoints from abuse
const rateLimits = new Map<string, { count: number; resetTime: number }>();

const customRateLimiter = (limit: number, windowMs: number) => {
  return (req: any, res: any, next: any) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const limitInfo = rateLimits.get(ip);

    if (!limitInfo || now > limitInfo.resetTime) {
      rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (limitInfo.count >= limit) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    limitInfo.count++;
    next();
  };
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(helmet({
    contentSecurityPolicy: false,
    frameguard: false,
  }));

  const key = process.env.GEMINI_API_KEY;
  if (key) {
    const masked = key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : "too short";
    console.log(`[API KEY] Loaded key: ${masked} (length: ${key.length})`);
  } else {
    console.log("[API KEY] No GEMINI_API_KEY environment variable found");
  }

  const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

  const retryAI = async (fn: () => Promise<any>, maxRetries = 2) => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const errMsg = typeof error?.message === 'string' ? error.message : '';
        const isQuota = errMsg.includes('Quota exceeded') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');
        if (isQuota) {
          // Immediately throw so fallback can instantly switch models without waiting through useless retries
          throw error;
        }
        // Only retry on transient rate limits (429) or transient server errors (5xx)
        const status = error.status || (error.response ? error.response.status : null);
        if (status === 429 || (status >= 500 && status < 600)) {
          const delay = Math.pow(2, i) * 1000 + Math.random() * 500;
          console.log(`[AI RETRY] Attempt ${i + 1} failed with status ${status}. Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  };

  const generateWithFallback = async (genAI: GoogleGenAI, primaryModel: string | undefined, contents: any, config: any) => {
    const requested = primaryModel || 'gemini-2.5-flash';
    const modelsToTry = Array.from(new Set([
      requested,
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ]));

    let lastError: any;
    for (const mName of modelsToTry) {
      try {
        return await retryAI(async () => {
          return await genAI.models.generateContent({
            model: mName,
            contents,
            config
          });
        }, 1);
      } catch (err: any) {
        lastError = err;
        const shortErr = typeof err?.message === 'string' ? err.message.slice(0, 100) : 'Error';
        console.log(`[AI FALLBACK] Model '${mName}' failed (${shortErr}). Trying next fallback model...`);
      }
    }
    throw lastError;
  };

  app.use(express.json({ limit: "20mb" })); // Support multimodal image payloads (X-Rays, CT Scans, Lab photos)
 
  const settingsFilePath = path.join(process.cwd(), 'settings.json');
 
  // API routes
  const SettingsSchema = z.object({
    theme: z.string().max(50).optional(),
    language: z.string().max(50).optional(),
    fontSize: z.string().max(50).optional(),
    fontFamily: z.string().max(50).optional(),
    accentColor: z.string().max(50).optional(),
    borderRadius: z.string().max(50).optional(),
    compactMode: z.string().max(50).optional(),
    density: z.string().max(50).optional(),
    reducedMotion: z.string().max(50).optional(),
  });

  app.get("/api/settings", (req, res) => {
    if (fs.existsSync(settingsFilePath)) {
      const settings = fs.readFileSync(settingsFilePath, 'utf-8');
      res.json(JSON.parse(settings));
    } else {
      res.json({});
    }
  });

  app.post("/api/settings", (req, res) => {
    const result = SettingsSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid settings format", details: result.error });
    }
    
    fs.writeFileSync(settingsFilePath, JSON.stringify(result.data, null, 2));
    res.json({ status: "success" });
  });

  // Guard expensive AI Chat Endpoint with Rate Limiting (60 requests/min max)
  const ChatSchema = z.object({
    messages: z.array(z.object({
      role: z.string(),
      content: z.string(),
      images: z.array(z.object({
        mimeType: z.string(),
        data: z.string(),
      })).optional(),
    })),
    provider: z.enum(['gemini', 'openrouter']),
    model: z.string().optional(),
    apiKey: z.string().optional(),
    systemInstruction: z.string().optional(),
  });

  app.post("/api/clinical-workflow/analyze", customRateLimiter(300, 60 * 1000), async (req, res) => {
    const validation = ChatSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid request body", details: validation.error });
    }
    const { messages, provider, model, apiKey, systemInstruction } = validation.data;

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured on server" });
      }
      try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Convert messages to Gemini format with flexible role matching and inlineData for images
        const contents = messages.map((m: any) => {
          const parts: any[] = [{ text: m.content }];
          if (m.images && Array.isArray(m.images)) {
            m.images.forEach((img: any) => {
              const cleanData = img.data.includes(',') ? img.data.split(',')[1] : img.data;
              parts.push({
                inlineData: {
                  mimeType: img.mimeType || 'image/jpeg',
                  data: cleanData
                }
              });
            });
          }
          return {
            role: ['model', 'ai', 'assistant'].includes(m.role?.toLowerCase()) ? 'model' : 'user',
            parts
          };
        });

        const result = await generateWithFallback(
          genAI,
          model,
          contents,
          { systemInstruction: systemInstruction || undefined }
        );
        
        res.json({ content: result.text || "" });
      } catch (error: any) {
        console.error("Gemini server error detail:", {
          message: error.message,
          stack: error.stack,
          status: error.status,
          code: error.code
        });
        
        // Map provider-specific codes to user-friendly messages if possible
        let userMessage = "Gemini processing failed.";
        let status = error.status || (error.response ? error.response.status : null);
        
        // If status is not directly available, try parsing from message string
        if (!status && typeof error.message === 'string' && error.message.includes('{')) {
          try {
            const match = error.message.match(/\{.*\}/s);
            if (match) {
              const parsed = JSON.parse(match[0]);
              status = parsed.error?.code || parsed.code;
            }
          } catch (e) {}
        }

        let httpStatusCode = 500;
        if (status === 403 || status === 401) {
          userMessage = "Authentication error with AI provider. Please check API key.";
          httpStatusCode = status;
        } else if (status === 429 || (error.message && (error.message.includes("quota") || error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("429")))) {
          userMessage = "AI provider rate limit / quota exceeded. Please wait a few moments before trying again.";
          httpStatusCode = 429;
        }

        res.status(httpStatusCode).json({ 
          error: userMessage,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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

  // Guard high-load Speech Synthesis with Rate Limiting (60 requests/min max)
  app.post("/api/ai/tts", customRateLimiter(60, 60 * 1000), async (req, res) => {
    const { text, voiceId } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is not configured on server" });
    }
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await generateWithFallback(
        genAI,
        'gemini-2.5-flash',
        [{ parts: [{ text }] }],
        {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceId || 'Kore' },
            },
          },
        }
      );

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio data returned from Gemini TTS");
      }

      res.json({ base64Audio });
    } catch (error: any) {
      console.error("Gemini TTS server error:", error);
      res.status(500).json({ error: error.message || "Failed to generate TTS" });
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
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[Server] Port ${PORT} is already in use.`);
      process.exit(1);
    } else {
      console.error("[Server] Error:", err);
    }
  });
}

startServer();
