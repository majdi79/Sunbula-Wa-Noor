
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return aiClient;
};

export const generateFeedback = async (studentName: string, achievement: string) => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `أنت معلم قرآن خبير. اكتب رسالة تشجيعية قصيرة وباللغة العربية الفصحى لوالدي الطالب(ة) "${studentName}" الذي أنجز اليوم: "${achievement}". الرسالة يجب أن تكون محفزة وتدعو له بالثبات والبركة في حفظ كتاب الله.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating feedback:", error);
    return "بارك الله في جهودكم ووفقكم لكل خير في حفظ كتابه الكريم.";
  }
};
