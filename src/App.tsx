import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, CircleDot, User, CreditCard, CheckCircle2, AlertCircle, ChevronRight, Wallet, MessageCircle, Copy, Share2 } from 'lucide-react';

// Types
type Prediction = 'CASA' | 'EMPATE' | 'FORA' | null;

interface Match {
  id: number;
  home: string;
  away: string;
}

interface Bet {
  id: string;
  predictions: Record<number, Prediction>;
}

const MOCK_MATCHES: Match[] = [
  { id: 1, home: "Flamengo", away: "Fluminense" },
  { id: 2, home: "São Paulo", away: "Corinthians" },
  { id: 3, home: "Atlético-MG", away: "Cruzeiro" },
  { id: 4, home: "Grêmio", away: "Internacional" },
  { id: 5, home: "Botafogo", away: "Fluminense" },
  { id: 6, home: "Vasco", away: "Bahia" },
  { id: 7, home: "Fortaleza", away: "Ceará" },
  { id: 8, home: "Athletico-PR", away: "Coritiba" },
  { id: 9, home: "Santos", away: "Bragantino" },
  { id: 10, home: "Cuiabá", away: "Goiás" },
  { id: 11, home: "Vitória", away: "Sport" },
  { id: 12, home: "Juventude", away: "Caxias" },
];

const PIX_KEY = "98984595785";
const WHATSAPP_NUMBER = "5598984595785";

export default function App() {
  const [userName, setUserName] = useState('');
  const [betOption, setBetOption] = useState<1 | 5>(1);
  const [allBets, setAllBets] = useState<Bet[]>([]);
  const [currentBetPredictions, setCurrentBetPredictions] = useState<Record<number, Prediction>>({});
  const [step, setStep] = useState<'intro' | 'payment' | 'betting' | 'success'>('intro');
  const [isPaying, setIsPaying] = useState(false);
  const [currentBetIndex, setCurrentBetIndex] = useState(0);

  const handlePrediction = (matchId: number, type: Prediction) => {
    setCurrentBetPredictions(prev => ({ ...prev, [matchId]: type }));
  };

  const isCurrentBetComplete = MOCK_MATCHES.every(m => currentBetPredictions[m.id] !== undefined && currentBetPredictions[m.id] !== null);

  const handleStart = () => {
    if (userName.trim()) {
      setStep('payment');
    }
  };

  const handlePaymentConfirm = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setStep('betting');
      setCurrentBetIndex(0);
      setAllBets([]);
      setCurrentBetPredictions({});
    }, 2000);
  };

  const handleNextBet = () => {
    const newBet: Bet = {
      id: `BOL-${Math.floor(Math.random() * 90000) + 10000}`,
      predictions: { ...currentBetPredictions }
    };
    
    const updatedBets = [...allBets, newBet];
    setAllBets(updatedBets);

    if (currentBetIndex + 1 < betOption) {
      setCurrentBetIndex(prev => prev + 1);
      setCurrentBetPredictions({});
    } else {
      setStep('success');
    }
  };

  const generateTicketText = () => {
    let text = `*BILHETE DO BOLÃO - ${userName}*\n`;
    text += `--------------------------\n`;
    allBets.forEach((bet, idx) => {
      text += `\n*APOSTA #${idx + 1} (${bet.id})*\n`;
      MOCK_MATCHES.forEach(m => {
        const pred = bet.predictions[m.id];
        const predChar = pred === 'CASA' ? 'C' : pred === 'EMPATE' ? 'E' : 'F';
        text += `${m.home} X ${m.away} -> [${predChar}]\n`;
      });
    });
    text += `\n--------------------------\n`;
    text += `*Chave PIX:* ${PIX_KEY}\n`;
    text += `*Prêmio:* Até R$ 5.000,00`;
    return encodeURIComponent(text);
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${generateTicketText()}`;
    window.open(url, '_blank');
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(PIX_KEY);
    alert("Chave PIX copiada!");
  };

  return (
    <div className="min-h-screen soccer-field-bg flex flex-col items-center p-4 md:p-8">
      {/* Header Section */}
      <header className="w-full max-w-2xl mb-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-4">
            <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse-green" />
            <div className="bg-primary p-4 rounded-full shadow-[0_0_30px_rgba(163,230,53,0.4)]">
              <CircleDot className="w-12 h-12 text-black" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
            JOGOS DA <span className="text-primary">RODADA!</span>
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-white/80 uppercase tracking-widest">
            Escolha seu palpite e comemore cada vitória
          </p>
        </motion.div>
      </header>

      <main className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-3xl p-8 text-center"
            >
              <h2 className="text-2xl font-bold mb-6">Participe do Bolão!</h2>
              
              <div className="space-y-4 mb-8">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary transition-colors text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setBetOption(1)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      betOption === 1 ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase text-white/50">1 Aposta</p>
                    <p className="text-xl font-black text-white">R$ 2,00</p>
                  </button>
                  <button
                    onClick={() => setBetOption(5)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      betOption === 5 ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase text-white/50">5 Apostas</p>
                    <p className="text-xl font-black text-primary">R$ 10,00</p>
                  </button>
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={!userName.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center gap-2 uppercase"
              >
                Ir para Pagamento <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-3xl p-8 text-center"
            >
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-black mb-2 uppercase italic">Pagamento PIX</h2>
              <p className="text-white/60 text-sm mb-6">
                Olá <span className="text-white font-bold">{userName}</span>, pague <span className="text-primary font-bold">R$ {betOption === 1 ? '2,00' : '10,00'}</span> para liberar suas <span className="text-white font-bold">{betOption}</span> apostas.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] text-white/40 font-bold uppercase">Chave PIX</p>
                  <p className="text-lg font-mono font-bold text-primary">{PIX_KEY}</p>
                </div>
                <button 
                  onClick={copyPixKey}
                  className="bg-primary/20 p-3 rounded-xl hover:bg-primary/30 transition-colors"
                >
                  <Copy className="w-5 h-5 text-primary" />
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl mb-8 inline-block">
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-8 grid-rows-8 gap-1 w-full h-full p-2">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white p-2 rounded-lg shadow-xl">
                      <CircleDot className="w-8 h-8 text-black" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handlePaymentConfirm}
                  disabled={isPaying}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase"
                >
                  {isPaying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Validando...
                    </>
                  ) : (
                    <>Já realizei o pagamento</>
                  )}
                </button>
                <button
                  onClick={() => setStep('intro')}
                  className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest"
                >
                  Alterar opção
                </button>
              </div>
            </motion.div>
          )}

          {step === 'betting' && (
            <motion.div
              key="betting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-[2.5rem] overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 pb-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="bg-primary px-4 py-1 rounded-full text-black font-black text-xs">
                    APOSTA {currentBetIndex + 1} DE {betOption}
                  </div>
                  <div className="bg-white/10 px-4 py-1 rounded-full text-white font-bold text-[10px]">
                    {new Date().toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="bg-primary px-4 py-1 rounded-full text-black font-black text-[10px] uppercase tracking-tighter">
                    CASA / EMPATE / FORA
                  </div>
                </div>
              </div>

              {/* Match List */}
              <div className="px-4 pb-6 space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {MOCK_MATCHES.map((match) => (
                  <div key={match.id} className="flex items-center gap-2 group">
                    <div className="flex-1 bg-primary rounded-full py-2 px-4 flex items-center justify-between shadow-lg">
                      <span className="text-[10px] font-black text-black uppercase truncate max-w-[80px]">
                        {match.home}
                      </span>
                      <span className="text-xs font-black text-black mx-2">X</span>
                      <span className="text-[10px] font-black text-black uppercase truncate max-w-[80px] text-right">
                        {match.away}
                      </span>
                    </div>
                    
                    <div className="flex gap-1">
                      {(['CASA', 'EMPATE', 'FORA'] as Prediction[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => handlePrediction(match.id, type)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            currentBetPredictions[match.id] === type
                              ? 'bg-primary border-primary text-black'
                              : 'bg-transparent border-primary/40 text-primary/40 hover:border-primary'
                          }`}
                        >
                          <span className="text-[8px] font-black">
                            {type === 'CASA' ? 'C' : type === 'EMPATE' ? 'E' : 'F'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Action */}
              <div className="p-6 bg-black/40 border-t border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-left">
                    <p className="text-[10px] text-white/50 uppercase font-bold">Progresso</p>
                    <p className="text-sm font-black text-primary">
                      {Object.keys(currentBetPredictions).length} / 12 JOGOS
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleNextBet}
                  disabled={!isCurrentBetComplete}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:grayscale text-black font-black py-4 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center gap-2 uppercase shadow-[0_10px_20px_rgba(163,230,53,0.2)]"
                >
                  {currentBetIndex + 1 < betOption ? 'Próxima Aposta' : 'Finalizar Bolão'} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              {/* Coupon Style Ticket */}
              <div className="bg-white text-black rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Jagged edges simulation */}
                <div className="absolute top-0 left-0 right-0 h-2 flex">
                   {Array.from({length: 20}).map((_, i) => (
                     <div key={i} className="flex-1 bg-black rounded-b-full" style={{height: '8px', marginTop: '-4px'}} />
                   ))}
                </div>

                <div className="p-8 pt-10 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-black p-3 rounded-full">
                      <CircleDot className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic leading-none mb-1">CUPOM DE APOSTA</h2>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-6">Comprovante Oficial</p>
                  
                  <div className="border-y-2 border-dashed border-black/10 py-4 mb-6 text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-bold uppercase text-black/40">Apostador</span>
                      <span className="text-xs font-black uppercase">{userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-bold uppercase text-black/40">Data</span>
                      <span className="text-xs font-black uppercase">{new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-bold uppercase text-black/40">Qtd Apostas</span>
                      <span className="text-xs font-black uppercase">{betOption}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar-light">
                    {allBets.map((bet, idx) => (
                      <div key={bet.id} className="bg-black/5 rounded-xl p-3 text-left">
                        <div className="flex justify-between items-center mb-2 border-b border-black/5 pb-1">
                          <span className="text-[10px] font-black uppercase">Aposta #{idx + 1}</span>
                          <span className="text-[10px] font-mono font-bold text-black/40">{bet.id}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {MOCK_MATCHES.map(m => {
                            const pred = bet.predictions[m.id];
                            const char = pred === 'CASA' ? 'C' : pred === 'EMPATE' ? 'E' : 'F';
                            return (
                              <div key={m.id} className="flex flex-col items-center bg-white rounded p-1 border border-black/5">
                                <span className="text-[8px] font-bold text-black/40">{m.id}</span>
                                <span className="text-[10px] font-black">{char}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black text-primary p-4 rounded-2xl mb-6">
                    <p className="text-[10px] font-bold uppercase mb-1 opacity-60">Prêmio Máximo Estimado</p>
                    <p className="text-3xl font-black italic">R$ 5.000,00</p>
                  </div>

                  {/* Bottom jagged edge */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 flex">
                    {Array.from({length: 20}).map((_, i) => (
                      <div key={i} className="flex-1 bg-black rounded-t-full" style={{height: '8px', marginBottom: '-4px'}} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <button
                  onClick={shareToWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase shadow-xl"
                >
                  <MessageCircle className="w-6 h-6" />
                  Enviar para WhatsApp
                </button>
                <button
                  onClick={() => {
                    setStep('intro');
                    setAllBets([]);
                    setCurrentBetPredictions({});
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-4 rounded-2xl transition-all uppercase"
                >
                  Novo Bolão
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="mt-12 text-center text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] max-w-xs">
        <p>© 2026 Bolão da Rodada - Jogue com responsabilidade. Proibido para menores de 18 anos.</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(163, 230, 53, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(163, 230, 53, 0.5);
        }

        .custom-scrollbar-light::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
