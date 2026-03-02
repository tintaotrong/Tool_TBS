
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { base64ToUint8Array, addWavHeader } from "../utils/audioUtils";

const getAI = () => {
  const customKey = localStorage.getItem('google_api_key');
  const apiKey = customKey || process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ inlineData: { mimeType, data: base64Audio } }, { text: "Hãy chuyển âm thanh này thành văn bản một cách chính xác." }]
      }
    });
    return response.text || "Không thể tạo bản chép lời.";
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string, voiceName: string = 'Puck'): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
      },
    });
    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(part => part.inlineData);
    const base64Audio = audioPart?.inlineData?.data;
    if (!base64Audio) throw new Error("Không nhận được dữ liệu âm thanh.");
    const pcmData = base64ToUint8Array(base64Audio);
    const wavBuffer = addWavHeader(pcmData, 24000, 1, 16);
    return URL.createObjectURL(new Blob([wavBuffer], { type: 'audio/wav' }));
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};

export const analyzeDocument = async (base64Data: string, mimeType: string, targetFormat: 'word' | 'excel' | 'ppt'): Promise<string> => {
  try {
    const ai = getAI();
    let prompt = targetFormat === 'excel' ? "Chuyển thành bảng HTML sạch cho Excel." : 
                 targetFormat === 'word' ? "Tái tạo HTML cho Word." : "Tạo dàn ý slide PPT.";
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] }
    });
    return (response.text || "").replace(/```html/g, "").replace(/```/g, "");
  } catch (error) {
    throw error;
  }
};

// Fixed: Added missing fetchNewsFeed implementation using Search Grounding and improved JSON extraction.
export const fetchNewsFeed = async (): Promise<any> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Tổng hợp 5 tin tức mới nhất về thị trường giày da, túi xách và kinh tế Việt Nam. Trả về định dạng JSON.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            articles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  trend: { type: Type.STRING },
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  source: { type: Type.STRING },
                  url: { type: Type.STRING },
                },
                required: ['category', 'trend', 'title', 'summary', 'source', 'url'],
              },
            },
            market_stats: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  change: { type: Type.STRING },
                },
                required: ['label', 'value', 'change'],
              },
            },
          },
          required: ['articles', 'market_stats'],
        },
      },
    });

    let jsonStr = response.text || "{}";
    
    // Robust cleanup to ensure we only attempt to parse a JSON object,
    // as grounding tools might include conversational text or markdown.
    const startIdx = jsonStr.indexOf('{');
    const endIdx = jsonStr.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
    }

    const data = JSON.parse(jsonStr);
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { data, sources };
  } catch (error) {
    console.error("News fetch error:", error);
    throw error;
  }
};
