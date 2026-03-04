
import { GoogleGenAI, Type } from "@google/genai";
import { Match, BetOption, PredictionInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateNewRound = async (): Promise<Match[]> => {
  const prompt = `Gere uma lista de 6 grandes jogos de futebol (reais ou fictícios inspirados em ligas reais como Brasileirão, Premier League, La Liga) para uma rodada de apostas. Retorne apenas o JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              homeTeam: { type: Type.STRING },
              awayTeam: { type: Type.STRING },
              time: { type: Type.STRING },
              league: { type: Type.STRING }
            },
            required: ["id", "homeTeam", "awayTeam", "time", "league"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating matches:", error);
    return [];
  }
};

export const getPredictionInsights = async (matches: Match[]): Promise<PredictionInsight[]> => {
  if (matches.length === 0) return [];
  
  const matchDetails = matches.map(m => `${m.homeTeam} vs ${m.awayTeam} (${m.league})`).join(", ");
  
  const prompt = `Analise os seguintes jogos de futebol e forneça uma recomendação de aposta (CASA, EMPATE ou FORA) para cada um, com uma breve justificativa de uma frase. Retorne em formato JSON.
  Jogos: ${matchDetails}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              matchId: { type: Type.STRING, description: "Use o homeTeam do jogo para identificar" },
              recommendation: { type: Type.STRING, enum: Object.values(BetOption) },
              reasoning: { type: Type.STRING }
            },
            required: ["matchId", "recommendation", "reasoning"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching insights:", error);
    return [];
  }
};
