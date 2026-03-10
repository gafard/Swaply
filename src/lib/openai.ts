import OpenAI from "openai";

export const getOpenAI = () => new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "dummy",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter for ranking
    "X-Title": "Swaply",
  }
});
