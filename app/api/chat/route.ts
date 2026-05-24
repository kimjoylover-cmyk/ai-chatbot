import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

async function fileToBase64(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const message = (formData.get("message") as string) || "";
    const image = formData.get("image") as File | null;

    const parts = [];

    if (image) {
      const base64 = await fileToBase64(image);

      parts.push({
        inlineData: {
          mimeType: image.type,
          data: base64,
        },
      });
    }

    parts.push({
      text: `
You are a professional watermark recommendation AI.
Analyze the uploaded image and recommend:
1. Best watermark position
2. Recommended opacity
3. Best watermark style
4. Suggested color
5. Reason

User request: ${message || "Recommend a watermark for this image."}
      `,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts }],
    });

    return Response.json({
      reply: response.text || "No response from AI.",
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return Response.json({
      reply: "Error analyzing the image. Check the Vercel logs for the exact error.",
    });
  }
}