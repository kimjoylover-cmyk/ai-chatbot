import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = `
You are a professional watermark recommendation AI.

Based on the user's description, recommend:
1. Best watermark position
2. Recommended opacity
3. Best watermark style
4. Suggested color
5. Reason

User description:
${body.message}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return Response.json({
      reply: response.text || "No response from AI.",
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return Response.json({
      reply: "Server error happened.",
    });
  }
}