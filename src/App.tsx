import React, { useState, useEffect } from 'react';
import { Trophy, Send, Bike, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from './assets/images/dgrau_logo_1785466160845.jpg';

type Selection = 'C' | 'E' | 'F' | null;

const INITIAL_MATCHES = [
  "Flamengo x Fluminense",
  "Palmeiras x São Paulo",
  "Corinthians x Santos",
  "Grêmio x Internacional",
  "Atlético-MG x Cruzeiro",
  "Real Madrid x Barcelona",
  "Man City x Liverpool",
  "Bayern x Dortmund",
  "PSG x Marseille",
  "Inter x Milan",
  "Arsenal x Chelsea",
  "Napoli x Juventus"
];

export default function App() {
  const [selections, setSelections] = useState<Selection[]>(new Array(12).fill(null));
  const [matches, setMatches] = useState<string[]>(INITIAL_MATCHES);
  const [clientName, setClientName] = useState('');
  const [ticketCode, setTicketCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentDate] = useState(new Date().toLocaleDateString('pt-BR'));

  useEffect(() => {
    generateNewCode();
  }, []);

  const generateNewCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTicketCode(result);
  };

  const handleSelect = (index: number, value: Selection) => {
    const newSelections = [...selections];
    newSelections[index] = value;
    setSelections(newSelections);
  };

  const isComplete = selections.every((s) => s !== null) && clientName.trim() !== '';

  const sendToWhatsApp = () => {
    if (!isComplete) return;

    const phoneNumber = '5598984595785';
    const selectionsText = selections.map((s, i) => `${matches[i]}: ${s}`).join('\n');
    const message = `*RODADA D'GRAU*\n\n*Data:* ${currentDate}\n*Cliente:* ${clientName}\n\nBilhete Validado!\nCódigo da Moto: *${ticketCode}*\n\nPalpites:\n${selectionsText}\n\nPrêmio:\n12 Acertos: R$ 1.000,00`;
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 md:p-6 bg-neutral-950 text-neutral-100 font-sans">
      <div className="w-full max-w-5xl bg-neutral-900/90 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row border border-emerald-500/30 backdrop-blur-md">
        
        {/* Left Panel - Dark Luxury Branding with Attached Logo */}
        <div className="md:w-2/5 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white p-6 md:p-8 flex flex-col items-center justify-between text-center relative overflow-hidden border-b md:border-b-0 md:border-r border-emerald-500/20">
          <div className="relative z-10 w-full flex flex-col items-center">
            
            {/* Official D'Grau Logo */}
            <div className="relative mb-6 group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-60 blur-md group-hover:opacity-100 transition duration-500"></div>
              <img 
                src={logoImg} 
                alt="D'GRAU APOSTAS - SUBA O NÍVEL DO SEU JOGO" 
                className="relative w-48 h-48 md:w-56 md:h-56 object-contain rounded-2xl border border-emerald-500/50 shadow-2xl bg-black"
                referrerPolicy="no-referrer"
              />
            </div>

            <h1 className="text-4xl md:text-5xl font-display uppercase leading-tight tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-white to-emerald-300 drop-shadow-[0_2px_10px_rgba(34,197,94,0.3)]">
              RODADA D'GRAU
            </h1>

            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-6 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> SUBA O NÍVEL DO SEU JOGO <Sparkles className="w-3.5 h-3.5" />
            </p>

            <div className="bg-neutral-900/80 border border-emerald-500/30 rounded-2xl p-4 w-full my-3 backdrop-blur shadow-inner">
              <h2 className="text-2xl font-display uppercase tracking-wide text-white mb-1">
                DIA DE JOGO É
              </h2>
              <h2 className="text-3xl font-display uppercase tracking-wide text-emerald-400 font-extrabold drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                DIA DE GANHAR
              </h2>
            </div>

            <p className="text-lg font-bold italic text-neutral-300 mt-2 mb-4 tracking-wide">
              APOSTE, TORÇA E GANHE!!!
            </p>
          </div>

          <div className="relative z-10 mt-auto pt-6 border-t border-emerald-500/20 w-full bg-neutral-950/60 rounded-xl p-3 border border-emerald-500/30 glow-green-sm">
            <p className="text-2xl md:text-3xl font-display uppercase tracking-wider text-emerald-400 font-extrabold">
              SOMENTE R$ 2,00
            </p>
          </div>

          {/* Decorative glowing background effects */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-20%] right-[-20%] w-72 h-72 bg-emerald-500 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-72 h-72 bg-emerald-600 rounded-full blur-[100px]"></div>
          </div>
        </div>

        {/* Right Panel - Game Grid */}
        <div className="md:w-3/5 bg-bokeh p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="text-center mb-6">
              <div className="flex justify-center items-center gap-2 mb-3">
                <div className="bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  Próxima Rodada - 12 Jogos
                </div>
                <div className="bg-emerald-600 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                  {currentDate}
                </div>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-display uppercase text-white mb-1 tracking-tight drop-shadow-sm">
                A CADA RODADA UMA NOVA EMOÇÃO
              </h3>
              
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">
                ESCOLHA: CASA / EMPATE / FORA • TORÇA E COMEMORE A CADA ACERTO
              </p>

              <div className="max-w-xs mx-auto mb-2">
                <input
                  type="text"
                  placeholder="NOME DO CLIENTE"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-900/90 border-2 border-emerald-500/40 focus:border-emerald-400 rounded-xl px-4 py-2 text-center font-bold text-emerald-300 placeholder:text-neutral-500 outline-none transition-all shadow-inner uppercase tracking-wider"
                />
              </div>
            </div>

            {/* Prize Table */}
            <div className="flex justify-center mb-5">
              <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 p-4 rounded-2xl border border-emerald-500/50 shadow-lg text-center min-w-[240px] glow-green-sm">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Prêmio Máximo</p>
                <p className="text-2xl font-display text-emerald-400 font-black tracking-wide drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                  12 ACERTOS: R$ 1.000,00
                </p>
              </div>
            </div>

            {/* Game Selection Table */}
            <div className="bg-neutral-900/90 rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden mb-5 backdrop-blur-sm">
              <div className="grid grid-cols-[1.5fr_auto_1fr] bg-gradient-to-r from-neutral-950 to-neutral-900 text-emerald-400 font-bold text-xs py-2.5 px-4 border-b border-emerald-500/20 uppercase tracking-wider">
                <span>PARTIDA</span>
                <span className="px-6 text-center">PALPITE</span>
                <span className="text-right">SELEÇÃO</span>
              </div>
              <div className="divide-y divide-neutral-800/80 max-h-[380px] overflow-y-auto custom-scrollbar">
                {selections.map((selection, idx) => (
                  <div key={idx} className="grid grid-cols-[1.5fr_auto_1fr] items-center py-2.5 px-4 hover:bg-neutral-800/50 transition-colors">
                    <div className="flex flex-col pr-2">
                      <span className="font-semibold text-neutral-200 text-xs md:text-sm leading-tight">{matches[idx]}</span>
                    </div>
                    <div className="flex gap-1.5 justify-center">
                      {(['C', 'E', 'F'] as Selection[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleSelect(idx, type)}
                          className={`w-9 h-9 md:w-10 md:h-10 rounded-lg font-display text-lg flex items-center justify-center transition-all transform active:scale-95 border ${
                            selection === type
                              ? 'bg-emerald-500 text-black border-emerald-300 font-extrabold shadow-[0_0_12px_rgba(34,197,94,0.6)] scale-105'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-emerald-500/50 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <div className="text-right">
                      <span className={`text-xs md:text-sm font-bold ${selection ? 'text-emerald-400' : 'text-neutral-600'}`}>
                        {selection ? (selection === 'C' ? 'CASA' : selection === 'E' ? 'EMPATE' : 'FORA') : '---'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="space-y-3.5 mt-2">
            <div className="flex items-center justify-between bg-neutral-900/90 p-3.5 rounded-2xl border border-emerald-500/30 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-950 border border-emerald-500/40 rounded-xl text-emerald-400 shadow-sm">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sorteio da Moto</p>
                  <p className="text-lg md:text-xl font-display tracking-widest text-emerald-400 font-black">{ticketCode}</p>
                </div>
              </div>
              <button 
                onClick={generateNewCode}
                className="text-xs font-bold text-emerald-400/80 hover:text-emerald-300 underline uppercase tracking-wider transition-colors"
              >
                Novo Código
              </button>
            </div>

            <button
              onClick={sendToWhatsApp}
              disabled={!isComplete}
              className={`w-full py-3.5 md:py-4 rounded-2xl font-display text-xl md:text-2xl uppercase flex items-center justify-center gap-3 transition-all shadow-xl tracking-wider ${
                isComplete 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-extrabold hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.99] glow-green cursor-pointer' 
                  : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-70'
              }`}
            >
              <Send className="w-5 h-5 md:w-6 md:h-6" />
              Validar no WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-neutral-900 border border-emerald-500/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl glow-green-lg"
            >
              <div className="w-20 h-20 bg-emerald-950 text-emerald-400 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-6 glow-green-sm">
                <Trophy className="w-10 h-10" />
              </div>
              <h4 className="text-3xl font-display uppercase mb-2 text-white">Bilhete Enviado!</h4>
              <p className="text-neutral-300 text-sm mb-6 leading-relaxed">
                Seus palpites foram enviados para validação no WhatsApp. Boa sorte no sorteio da moto!
              </p>
              <button 
                onClick={() => {
                  setShowSuccess(false);
                  setSelections(new Array(12).fill(null));
                  generateNewCode();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-extrabold rounded-xl uppercase tracking-wider hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg glow-green-sm"
              >
                Novo Bilhete
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
