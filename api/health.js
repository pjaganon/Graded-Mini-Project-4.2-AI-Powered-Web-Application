export default {
  async fetch() {
    return Response.json({
      ok: true,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
    });
  },
};
