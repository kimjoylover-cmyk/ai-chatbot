import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const message =
      (formData.get("message") as string) || "";

    const image = formData.get("image") as File | null;

    let parts: any[] = [];

    if (image) {

      const bytes = await image.arrayBuffer();

      const base64 = Buffer.from(bytes).toString("base64");

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

Analyze the uploaded image carefully and recommend:

1. Best watermark position
2. Recommended opacity
3. Best watermark style
4. Suggested color
5. Why this watermark works well for the image

User request:
${message}
      `,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    });

    return Response.json({
      reply:
        response.text ||
        "No watermark recommendation generated.",
    });

  } catch (error) {

    console.error("API ERROR:", error);

    return Response.json(
      {
        reply:
          "Error analyzing the image.",
      },
      {
        status: 500,
      }
    );
  }
}