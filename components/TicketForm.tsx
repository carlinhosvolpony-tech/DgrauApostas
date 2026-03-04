
import React, { useState } from 'react';
import { RoundData, UserSelection, Prediction } from '../types';
import { Share2, User, Calendar, SoccerBall } from './Icons';

interface TicketFormProps {
  roundData: RoundData;
}

const TicketForm: React.FC<TicketFormProps> = ({ roundData }) => {
  const [selections, setSelections] = useState<UserSelection[]>([]);
  const [userName, setUserName] = useState('');

  const handlePick = (matchId: string, pick: Prediction) => {
    setSelections(prev => {
      const filtered = prev.filter(s => s.matchId !== matchId);
      return [...filtered, { matchId, pick }];
    });
  };

  const getPick = (matchId: string) => {
    return selections.find(s => s.matchId === matchId)?.pick || null;
  };

  const sendWhatsApp = () => {
    if (!userName.trim()) {
        alert("Por favor, digite seu nome completo.");
        return;
    }
    if (selections.length === 0) {
      alert("Selecione pelo menos um palpite.");
      return;
    }

    let message = `⚽ *D'GRAU APOSTAS - BILHETE DIGITAL* ⚽\n`;
    message += `🆔 *COD:* ${roundData.code}\n\n`;
    message += `👤 *CLIENTE:* ${userName.toUpperCase()}\n`;
    message += `📅 *DATA:* ${roundData.date}\n\n`;
    message += `*PALPITES:*\n`;

    roundData.matches.forEach((match, idx) => {
      const pick = getPick(match.id);
      const pickLabel = pick === 'HOME' ? 'CASA (1)' : pick === 'DRAW' ? 'EMPATE (X)' : pick === 'AWAY' ? 'FORA (2)' : 'SEM ESCOLHA';
      message += `${idx + 1}. ${match.homeTeam} x ${match.awayTeam}: *${pickLabel}*\n`;
    });

    message += `\n--------------------------\n`;
    message += `✅ *Validação:* ${roundData.code}\n`;
    message += `⚠️ _Validar mediante pagamento._`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${roundData.adminWhatsapp}?text=${encoded}`, '_blank');
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#9FE801] selection:text-black pt-safe">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-[#9FE801]/5 to-transparent pointer-events-none" />
      
      <div className="relative max-w-lg mx-auto px-4 pt-8 pb-32">
        
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <div className="bg-[#9FE801] rounded-2xl p-4 border-[5px] border-black shadow-[0_0_25px_rgba(159,232,1,0.25)] -rotate-2">
              <SoccerBall className="w-12 h-12 text-black" />
            </div>
            <div className="absolute -bottom-1 -right-2 bg-white text-black text-[9px] font-black px-2 py-0.5 rounded border-2 border-black rotate-3">
              VIP
            </div>
          </div>
          
          <h1 className="text-[52px] md:text-[64px] font-black oswald uppercase tracking-tighter italic leading-[0.8] mb-1">
            JOGOS DA <br/><span className="text-[#9FE801] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">RODADA!</span>
          </h1>
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="h-[2px] w-6 bg-[#9FE801]/30"></span>
            <span className="text-[12px] font-black text-[#9FE801] tracking-widest oswald italic">COD: {roundData.code}</span>
            <span className="h-[2px] w-6 bg-[#9FE801]/30"></span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
            D'GRAU APOSTAS • BILHETE DIGITAL
          </p>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-[#9FE801]/10 p-2 rounded-xl">
                <Calendar className="text-[#9FE801] w-5 h-5" />
            </div>
            <div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-wider">RODADA DE</p>
                <p className="font-bold text-sm oswald italic tracking-wide text-white">{roundData.date || 'DATA NÃO DEFINIDA'}</p>
            </div>
          </div>
          <div className="bg-[#9FE801] text-black px-3 py-1.5 rounded-xl">
             <span className="text-[10px] font-black uppercase tracking-tighter italic oswald">D'GRAU</span>
          </div>
        </div>

        <div className="mb-8">
           <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <User className="text-[#9FE801] w-5 h-5 opacity-50 group-focus-within:opacity-100 transition-opacity" />
              </div>
              <input 
                type="text" 
                placeholder="SEU NOME COMPLETO"
                autoComplete="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#0D0D0D] border-2 border-white/5 rounded-2xl pl-14 pr-6 py-5 font-black uppercase tracking-widest outline-none focus:border-[#9FE801]/30 focus:bg-black transition-all placeholder:text-white/10 text-white text-base shadow-inner"
              />
           </div>
        </div>

        <div className="flex justify-between items-center px-2 mb-4">
           <span className="text-[10px] font-black oswald italic text-white/30 uppercase tracking-widest">LISTA DE CONFRONTOS</span>
           <div className="flex gap-8 mr-4">
              <span className="text-[9px] font-black text-[#9FE801] w-8 text-center opacity-60 uppercase">1</span>
              <span className="text-[9px] font-black text-[#9FE801] w-8 text-center opacity-60 uppercase">X</span>
              <span className="text-[9px] font-black text-[#9FE801] w-8 text-center opacity-60 uppercase">2</span>
           </div>
        </div>

        <div className="space-y-4">
          {roundData.matches.map((match, idx) => (
            <div key={match.id} className="animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 40}ms` }}>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#9FE801] rounded-2xl p-4 flex items-center justify-between min-w-0 shadow-[0_4px_0_rgba(159,232,1,0.15)]">
                  <div className="flex-1 text-center overflow-hidden">
                    <span className="text-black font-black text-[10px] uppercase truncate block">{match.homeTeam}</span>
                  </div>
                  <div className="mx-2 flex flex-col items-center">
                    <span className="text-black font-black italic text-[12px] leading-none">VS</span>
                  </div>
                  <div className="flex-1 text-center overflow-hidden">
                    <span className="text-black font-black text-[10px] uppercase truncate block">{match.awayTeam}</span>
                  </div>
                </div>
                
                <div className="flex gap-1 ml-1">
                  {(['HOME', 'DRAW', 'AWAY'] as Prediction[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => handlePick(match.id, type)}
                      className={`
                        w-11 h-11 rounded-xl border-2 font-black transition-all flex items-center justify-center text-sm
                        active:scale-90 touch-manipulation
                        ${getPick(match.id) === type 
                          ? 'bg-[#9FE801] border-[#9FE801] text-black shadow-[0_0_15px_rgba(159,232,1,0.3)]' 
                          : 'bg-[#0D0D0D] border-white/5 text-white/20'}
                      `}
                    >
                      {type === 'DRAW' ? 'X' : type === 'HOME' ? '1' : '2'}
                    </button>
                  ))}
                </div>
              </div>
              {idx < roundData.matches.length - 1 && (
                <div className="h-[1px] w-full mt-4 ticket-dashed opacity-10" />
              )}
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 w-full px-4 pb-safe z-50 pointer-events-none">
           <div className="max-w-lg mx-auto pb-6 pointer-events-auto">
              <button 
                onClick={sendWhatsApp}
                className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#9FE801] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.8)] border-[4px] border-black oswald italic text-xl uppercase tracking-tighter"
              >
                <Share2 className="w-6 h-6" />
                FINALIZAR APOSTA
              </button>
           </div>
        </div>

        <div className="text-center opacity-10 mt-12 pb-12">
            <p className="text-[8px] font-black uppercase tracking-[0.4em]">
               D'GRAU APOSTAS • COD: {roundData.code}
            </p>
        </div>

      </div>
    </div>
  );
};

export default TicketForm;
