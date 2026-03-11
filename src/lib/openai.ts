import OpenAI from "openai";

function resolveReferer() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const getOpenAI = () => new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "dummy",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": resolveReferer(),
    "X-Title": "Swaply",
  }
});
