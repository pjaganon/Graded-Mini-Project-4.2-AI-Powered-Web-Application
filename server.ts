import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { analyzeRequestSchema } from "./src/validation.ts";
import { generateTripAnalysis, getGeminiApiKey } from "./src/geminiAnalysis.ts";

const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), ".env");

dotenv.config({ path: envPath });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readGeminiApiKey(): string | null {
  // Vite dev restarts its middleware on .env changes but does not reload this process.
  if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: envPath, override: true });
  }
  return getGeminiApiKey();
}

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:
          process.env.NODE_ENV === "production"
            ? ["'self'"]
            : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

app.use(express.json({ limit: "50kb" }));

const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many analysis requests. Please try again later." },
});

const PORT = 3000;

app.post("/api/gemini/analyze", analyzeLimiter, async (req, res) => {
  try {
    const parsed = analyzeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request. Check trip fields and try again." });
    }

    if (!readGeminiApiKey()) {
      return res.status(503).json({
        error:
          "AI analysis is unavailable. Add GEMINI_API_KEY to a .env file in the project root (not .env.example), then restart the dev server.",
      });
    }

    const analysisText = await generateTripAnalysis(parsed.data);
    res.json({ analysis: analysisText });
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to generate analysis. Please try again later." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    const keyStatus = readGeminiApiKey() ? "configured" : "missing — create .env from .env.example";
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GEMINI_API_KEY: ${keyStatus}`);
  });
}

startServer();
