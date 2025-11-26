
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CoffeeResult, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const coffeeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A creative name for this coffee blend" },
    shortDescription: { type: Type.STRING, description: "One sentence summary (max 15 words)" },
    story: { type: Type.STRING, description: "A rich, evocative paragraph describing the coffee's character, origin atmosphere, and drinking experience (approx 60-80 words)." },
    origin: { type: Type.STRING, description: "Country of origin" },
    region: { type: Type.STRING, description: "Specific growing region (e.g. Yirgacheffe, Huila, Antigua)" },
    altitude: { type: Type.STRING, description: "Growing altitude (e.g. 1900-2200 masl)" },
    process: { type: Type.STRING, description: "Processing method (e.g. Washed, Natural, Honey, Anaerobic)" },
    roastLevel: { type: Type.STRING, description: "Light, Medium, Dark, City+, etc." },
    tastingNotes: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "3-4 specific flavor notes"
    },
    brewingMethod: { type: Type.STRING, description: "Best way to brew this bean" },
    matchScore: { type: Type.INTEGER, description: "A calculated match score from 85-99" },
    radarData: {
      type: Type.OBJECT,
      properties: {
        sweetness: { type: Type.INTEGER, description: "Scale 1-10" },
        acidity: { type: Type.INTEGER, description: "Scale 1-10" },
        body: { type: Type.INTEGER, description: "Scale 1-10" },
        bitterness: { type: Type.INTEGER, description: "Scale 1-10" },
        aroma: { type: Type.INTEGER, description: "Scale 1-10" },
        aftertaste: { type: Type.INTEGER, description: "Scale 1-10" }
      },
      required: ["sweetness", "acidity", "body", "bitterness", "aroma", "aftertaste"]
    }
  },
  required: ["title", "shortDescription", "story", "origin", "region", "altitude", "process", "roastLevel", "tastingNotes", "brewingMethod", "matchScore", "radarData"]
};

export const generateCoffeeBlend = async (
  flavors: string[], 
  x: number, 
  y: number,
  language: Language
): Promise<CoffeeResult> => {
  const modelId = "gemini-2.5-flash";
  
  // Mapping coordinates to descriptive terms
  const bodyTerm = y > 0 ? "Heavy/Syrupy Body" : "Tea-like/Light Body";
  const acidityTerm = x > 0 ? "Bright/Citric Acidity" : "Low/Smooth Acidity";

  const langInstruction = language === 'zh' 
    ? "IMPORTANT: Output ALL string values in Simplified Chinese (zh-CN)." 
    : "Output all string values in English.";

  const prompt = `
    I am creating a highly personalized specialty coffee profile.
    User's Flavor Tags: ${flavors.join(", ")}.
    Texture/Structure Preference: ${bodyTerm} and ${acidityTerm}.
    
    Create a sophisticated coffee recommendation. 
    It should sound like a real, premium single-origin or master blend.
    The 'story' should be poetic and transporting.
    The 'radarData' numbers (1-10) should accurately reflect the flavors and balance chosen.
    
    ${langInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: coffeeSchema,
        systemInstruction: "You are a world-class Q Grader and coffee storyteller.",
        temperature: 0.75,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as CoffeeResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // Fallback data
    if (language === 'zh') {
       return {
        title: "高地迷雾",
        shortDescription: "来自云雾森林的神秘与平衡之选。",
        story: "诞生于寂静统治的高海拔迷雾中，这款咖啡带来深刻的清晰时刻。豆子在黎明时分采摘，捕捉了清凉的露水和大地的深沉共鸣。每一口都像是在讲述古老土壤和精心呵护的故事，为您忙碌的一天提供风味的避风港。",
        origin: "埃塞俄比亚",
        region: "西达摩",
        altitude: "2100米",
        process: "水洗",
        roastLevel: "中浅烘焙",
        tastingNotes: ["茉莉花", "佛手柑", "蜂蜜"],
        brewingMethod: "手冲 (V60)",
        matchScore: 92,
        radarData: { sweetness: 8, acidity: 7, body: 5, bitterness: 3, aroma: 9, aftertaste: 8 }
      };
    }

    return {
      title: "Mist of the Highlands",
      shortDescription: "A balanced and mysterious cup from the cloud forests.",
      story: "Born in the high-altitude mists where silence reigns, this coffee brings a moment of profound clarity. The beans are harvested at dawn, capturing the cool dew and the earth's deep resonance. Every sip unfolds like a story of ancient soils and careful hands, offering a sanctuary of flavor in your busy day.",
      origin: "Ethiopia",
      region: "Sidama",
      altitude: "2100 masl",
      process: "Washed",
      roastLevel: "Medium-Light",
      tastingNotes: ["Jasmine", "Bergamot", "Honey"],
      brewingMethod: "Pour Over (V60)",
      matchScore: 92,
      radarData: { sweetness: 8, acidity: 7, body: 5, bitterness: 3, aroma: 9, aftertaste: 8 }
    };
  }
};

export const chatWithBarista = async (history: {role: 'user' | 'model', text: string}[], message: string, language: Language) => {
   const langInstruction = language === 'zh' 
    ? "Reply in Simplified Chinese (zh-CN)." 
    : "Reply in English.";

   const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
    config: {
      systemInstruction: `You are a friendly, knowledgeable coffee barista. Keep answers short, warm, and helpful. You help people discover new coffee flavors. ${langInstruction}`
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text;
}