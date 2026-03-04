
import React, { useState } from 'react';
import { Match, RoundData } from '../types';
import { Trophy, Share2, Send, Wand2, Hash } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const AdminPanel: React.FC = () => {
  const [adminWhatsapp, setAdminWhatsapp] = useState('');
  const [date, setDate] = useState('');
  const [matches, setMatches] = useState<Match[]>(
    Array(12).fill(null).map((_, i) => ({ id: `${i}`, homeTeam: '', awayTeam: '' }))
  );
  const [shareUrl, setShareUrl] = useState('');
  const [generatedTicketCode, setGeneratedTicketCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const updateMatch = (index: number, field: 'homeTeam' | 'awayTeam', value: string) => {
    const newMatches = [...matches];
    newMatches[index] = { ...newMatches[index], [field]: value };
    setMatches(newMatches);
  };

  const generateLink = () => {
    // Gera código de 6 dígitos alfanuméricos
    const ticketCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedTicketCode(ticketCode);

    const shortData = {
      d: date,
      w: adminWhatsapp.replace(/\D/g, ''),
      c: ticketCode,
      m: matches
        .filter(m => m.homeTeam && m.awayTeam)
        .map(m => ({ h: m.homeTeam, a: m.awayTeam }))
    };

    const jsonStr = JSON.stringify(shortData);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    const url = `${window.location.origin}${window.location.pathname}#t/${encodeURIComponent(encoded)}`;
    setShareUrl(url);
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Gere uma lista de 12 confrontos de futebol brasileiros ou europeus famosos para um bilhete de apostas.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                homeTeam: { type: Type.STRING },
                awayTeam: { type: Type.STRING },
              },
              required: ["homeTeam", "awayTeam"]
            },
          },
        }
      });
      
      const suggested = JSON.parse(response.text || '[]');
      if (Array.isArray(suggested)) {
        const newMatches = suggested.slice(0, 12).map((m: any, i: number) => ({
          id: `${i}`,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam
        }));
        while(newMatches.length < 12) {
            newMatches.push({ id: `${newMatches.length}`, homeTeam: '', awayTeam: '' });
        }
        setMatches(newMatches);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao usar IA para gerar partidas.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-safe pb-safe">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#9FE801] p-2 rounded-lg">
            <Trophy className="text-black w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold oswald uppercase tracking-tighter italic">
            D'grau <span className="text-[#9FE801]">Apostas</span>
          </h1>
        </div>
        <button 
          onClick={generateWithAI}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all text-xs font-bold"
        >
          <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Gerando...' : 'Sugestão IA'}
        </button>
      </header>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-2xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">WhatsApp Recebedor</label>
            <input 
              type="tel" 
              placeholder="Ex: 5511999999999"
              value={adminWhatsapp}
              onChange={(e) => setAdminWhatsapp(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-[#9FE801] outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Data do Bilhete</label>
            <input 
              type="text" 
              placeholder="Ex: Sábado, 25 de Maio"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-[#9FE801] outline-none transition-all text-sm"
            />
          </div>
        </div>

        <h3 className="text-sm font-black mb-4 oswald uppercase italic text-[#9FE801] tracking-widest">Gerenciador de Partidas</h3>
        <div className="space-y-2">
          {matches.map((match, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-black/50 p-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-600 font-bold w-4">{idx + 1}</span>
              <input 
                type="text" 
                placeholder="Casa"
                value={match.homeTeam}
                onChange={(e) => updateMatch(idx, 'homeTeam', e.target.value)}
                className="flex-1 bg-transparent border-b border-white/5 px-2 py-1 text-xs outline-none focus:border-[#9FE801]"
              />
              <span className="text-gray-700 font-bold text-[10px]">X</span>
              <input 
                type="text" 
                placeholder="Fora"
                value={match.awayTeam}
                onChange={(e) => updateMatch(idx, 'awayTeam', e.target.value)}
                className="flex-1 bg-transparent border-b border-white/5 px-2 py-1 text-xs outline-none focus:border-[#9FE801]"
              />
            </div>
          ))}
        </div>

        <button 
          onClick={generateLink}
          className="w-full mt-8 bg-[#9FE801] text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-[#9FE801]/10 text-sm uppercase italic oswald"
        >
          <Share2 className="w-5 h-5" />
          Gerar Link Encurtado
        </button>
      </div>

      {shareUrl && (
        <div className="bg-[#9FE801]/5 border border-[#9FE801]/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-[#9FE801] font-black uppercase tracking-widest">Link de Acesso do Cliente:</p>
            <div className="flex items-center gap-2 bg-[#9FE801] text-black px-2 py-1 rounded font-black text-[10px]">
              <Hash className="w-3 h-3" />
              COD: {generatedTicketCode}
            </div>
          </div>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={shareUrl} 
              className="flex-1 bg-black border border-white/5 rounded-lg px-3 py-2 text-[10px] font-mono truncate text-gray-400"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert(`Link copiado! Código do Bilhete: ${generatedTicketCode}`);
              }}
              className="bg-white text-black px-4 py-2 rounded-lg font-black text-xs hover:bg-[#9FE801] transition-colors"
            >
              COPIAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
