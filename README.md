<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c360130d-62fe-4357-ac51-3b830dbe3c06

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your `GEMINI_API_KEY` (get one at https://aistudio.google.com/apikey)
3. Run the app:
   `npm run dev`

## Deploy on Vercel

1. Import this GitHub repo in Vercel.
2. Add Environment Variable `GEMINI_API_KEY` (same key as local `.env`).
3. Redeploy. The AI assistant uses the serverless route at `/api/gemini/analyze`.
