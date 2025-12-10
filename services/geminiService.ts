import { GoogleGenAI, Type } from "@google/genai";
import { TravelChecklist } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

export const generateTravelAdvice = async (
  currentWeather: string,
  destination: string,
  mode: string
): Promise<TravelChecklist> => {
  try {
    const prompt = `
      当前天气: ${currentWeather}。
      用户行程: 前往 ${destination}，出行方式: ${mode}。
      请生成一份雨天出行清单和安全建议。
      核心关注: "最少淋雨" 和 "安全优先"。
      请包含：
      1. 天气简述 (体感/降雨概率)
      2. 装备清单 (如雨伞、防滑鞋、防水袋等)
      3. 安全提示 (针对该出行方式，如避开积水、减速慢行)
      4. 着装建议
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weatherSummary: { type: Type.STRING },
            gear: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "出行必备物品清单"
            },
            safetyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "针对性的安全提示"
            },
            clothingRecommendation: { type: Type.STRING, description: "建议穿着" }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI 未返回数据");
    return JSON.parse(text) as TravelChecklist;

  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return {
      weatherSummary: "暂时无法分析天气数据。",
      gear: ["雨伞", "备用衣物"],
      safetyTips: ["雨天路滑，请注意安全。"],
      clothingRecommendation: "建议穿着防水外套。"
    };
  }
};

export const chatWithAssistant = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: modelId,
      history: history,
      config: {
        systemInstruction: `你是“雨行”(RainGuard) 智能助手。你的目标是帮助用户在雨天安全、干爽地出行。
        
        你有以下核心能力，请在对话中体现：
        1. **最少淋雨路线**：优先推荐地下通道、商场连廊、有顶棚的路线。
        2. **避雨点推荐**：推荐附近的商场、便利店、地铁站作为临时避雨点。
        3. **出行建议**：根据雨势大小，建议是否延后出行或更改交通方式。
        4. **安全提示**：提醒积水路段、车辆盲区、路面湿滑。
        5. **雨具资源**：提示附近的共享雨伞点。
        
        如果在暴雨橙色/红色预警下，请强烈建议用户暂停户外活动。
        保持回答简洁、温暖、实用。使用中文回复。
        `,
      },
    });

    const result = await chat.sendMessage({ message });
    return result.text || "雨云太厚了，我好像听不太清，请再说一遍？";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "网络连接不稳定，请稍后重试。";
  }
};
