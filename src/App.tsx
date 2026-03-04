import React, { useState, useEffect } from 'react';
import { Trophy, Smartphone, Send, QrCode, Bike } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Selection = 'C' | 'E' | 'F' | null;

export default function App() {
  const [selections, setSelections] = useState<Selection[]>(new Array(12).fill(null));
  const [ticketCode, setTicketCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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

  const isComplete = selections.every((s) => s !== null);

  const sendToWhatsApp = () => {
    if (!isComplete) return;

    const phoneNumber = '5598984595785';
    const selectionsText = selections.map((s, i) => `${i + 1}: ${s}`).join('\n');
    const message = `*RODADA D'GRAU*\n\nBilhete Validado!\nCódigo da Moto: *${ticketCode}*\n\nPalpites:\n${selectionsText}\n\nPrêmios:\n12 Acertos: R$ 2.000\n11 Acertos: R$ 1.500\n10 Acertos: R$ 1.000`;
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-200">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row border border-white/20">
        
        {/* Left Panel - Dark Branding */}
        <div className="md:w-2/5 bg-[#4a4a4a] text-white p-8 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-6xl font-display uppercase leading-tight tracking-tighter mb-2">
              RODADA<br />D'GRAU
            </h1>
            
            <div className="my-8 flex justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                <img 
                  src="https://www.svgrepo.com/show/303157/soccer-ball-variant-svgrepo-com.svg" 
                  alt="Soccer Ball" 
                  className="w-16 h-16"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <h2 className="text-3xl font-display uppercase tracking-wide mb-8">
              DIA DE JOGO É<br />DIA DE GANHAR
            </h2>

            <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-lg">
              <QrCode className="w-32 h-32 text-black" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest mb-8">
              ESCANEIE E BAIXE O APP
            </p>

            <p className="text-xl font-bold italic mb-4">
              APOSTE, TORÇA E GANHE!!!
            </p>
          </div>

          <div className="relative z-10 mt-auto pt-8 border-t border-white/20 w-full">
            <p className="text-2xl font-display uppercase">
              SOMENTE R$ 2,00
            </p>
          </div>

          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-black rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Right Panel - Game Grid */}
        <div className="md:w-3/5 bg-bokeh p-8 flex flex-col">
          <div className="text-center mb-8">
            <h3 className="text-4xl font-display uppercase text-neutral-800 mb-2">
              A CADA RODADA UMA NOVA EMOÇÃO
            </h3>
            <div className="space-y-1">
              <p className="text-xl font-bold text-neutral-700">ESCOLHA: CASA / EMPATE / FORA</p>
              <p className="text-lg font-medium text-neutral-600">TORÇA E COMEMORE A CADA ACERTO</p>
            </div>
          </div>

          {/* Prize Table */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-white shadow-sm text-center">
              <p className="text-xs font-bold text-neutral-500 uppercase">12 Acertos</p>
              <p className="text-xl font-display text-emerald-600">R$ 2.000</p>
            </div>
            <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-white shadow-sm text-center">
              <p className="text-xs font-bold text-neutral-500 uppercase">11 Acertos</p>
              <p className="text-xl font-display text-emerald-600">R$ 1.500</p>
            </div>
            <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-white shadow-sm text-center">
              <p className="text-xs font-bold text-neutral-500 uppercase">10 Acertos</p>
              <p className="text-xl font-display text-emerald-600">R$ 1.000</p>
            </div>
          </div>

          {/* Game Selection Table */}
          <div className="flex-grow bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white overflow-hidden mb-8">
            <div className="grid grid-cols-[1fr_auto_1fr] bg-neutral-800 text-white font-bold text-sm py-2 px-4">
              <span>JOGO</span>
              <span className="px-8">PALPITE</span>
              <span className="text-right">RESULTADO</span>
            </div>
            <div className="divide-y divide-neutral-200 max-h-[400px] overflow-y-auto">
              {selections.map((selection, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_auto_1fr] items-center py-3 px-4 hover:bg-neutral-50 transition-colors">
                  <span className="font-bold text-neutral-400">#{String(idx + 1).padStart(2, '0')}</span>
                  <div className="flex gap-2">
                    {(['C', 'E', 'F'] as Selection[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => handleSelect(idx, type)}
                        className={`w-10 h-10 rounded-lg font-display text-xl flex items-center justify-center transition-all transform active:scale-95 border-2 ${
                          selection === type
                            ? 'bg-neutral-800 text-white border-neutral-800 shadow-md'
                            : 'bg-white text-neutral-400 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${selection ? 'text-neutral-800' : 'text-neutral-300'}`}>
                      {selection ? (selection === 'C' ? 'CASA' : selection === 'E' ? 'EMPATE' : 'FORA') : '---'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Bike className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase">Sorteio da Moto</p>
                  <p className="text-xl font-display tracking-widest text-neutral-800">{ticketCode}</p>
                </div>
              </div>
              <button 
                onClick={generateNewCode}
                className="text-xs font-bold text-neutral-400 hover:text-neutral-600 underline uppercase"
              >
                Novo Código
              </button>
            </div>

            <button
              onClick={sendToWhatsApp}
              disabled={!isComplete}
              className={`w-full py-4 rounded-2xl font-display text-2xl uppercase flex items-center justify-center gap-3 transition-all shadow-lg ${
                isComplete 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]' 
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-6 h-6" />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-display uppercase mb-2">Bilhete Enviado!</h4>
              <p className="text-neutral-600 mb-8">
                Seus palpites foram enviados para validação. Boa sorte no sorteio da moto!
              </p>
              <button 
                onClick={() => {
                  setShowSuccess(false);
                  setSelections(new Array(12).fill(null));
                  generateNewCode();
                }}
                className="w-full py-3 bg-neutral-800 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-neutral-900 transition-colors"
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
