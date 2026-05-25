import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

async function callGeminiAPIWithRetry(fullPrompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: fullPrompt,
  });

  return response.text || "No response from AI";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const reply = await callGeminiAPIWithRetry(body.message);

    return Response.json({ reply });
  } catch (error) {
    console.error("API ERROR:", error);

    return Response.json(
      { reply: "Server error happened." },
      { status: 500 }
    );
  }
}