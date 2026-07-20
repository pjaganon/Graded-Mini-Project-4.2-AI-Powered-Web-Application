/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Vercel serverless handler for AI budget analysis.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeRequestSchema } from "../../src/validation";
import { generateTripAnalysis, getGeminiApiKey } from "../../src/geminiAnalysis";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const parsed = analyzeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request. Check trip fields and try again." });
    }

    if (!getGeminiApiKey()) {
      return res.status(503).json({
        error:
          "AI analysis is unavailable. Set GEMINI_API_KEY in your Vercel project Environment Variables, then redeploy.",
      });
    }

    const analysis = await generateTripAnalysis(parsed.data);
    return res.status(200).json({ analysis });
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: "Failed to generate analysis. Please try again later." });
  }
}
