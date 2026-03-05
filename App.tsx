
import React, { useState, useEffect } from 'react';
import { Match, BetOption, UserBet, PredictionInsight } from './types';
import BetCard from './components/BetCard';
import { getPredictionInsights, generateNewRound } from './services/geminiService';

const DEFAULT_MATCHES: Match[] = [
  { id: '1', homeTeam: 'Flamengo', awayTeam: 'Palmeiras', time: '16:00', league: 'Brasileirão Série A' },
  { id: '2', homeTeam: 'São Paulo', awayTeam: 'Corinthians', time: '18:30', league: 'Brasileirão Série A' },
  { id: '3', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', time: '15:45', league: 'La Liga' },
  { id: '4', homeTeam: 'Liverpool', awayTeam: 'Man City', time: '12:30', league: 'Premier League' },
  { id: '5', homeTeam: 'Inter', awayTeam: 'Milan', time: '14:45', league: 'Serie A' },
  { id: '6', homeTeam: 'PSG', awayTeam: 'Marseille', time: '16:00', league: 'Ligue 1' },
];

const App: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>(DEFAULT_MATCHES);
  const [roundTitle, setRoundTitle] = useState('RODADA DE HOJE');
  const [bets, setBets] = useState<UserBet[]>([]);
  const [insights, setInsights] = useState<PredictionInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editMatches, setEditMatches] = useState<Match[]>([]);
  const [editTitle, setEditTitle] = useState('');

  const fetchRoundData = async (newMatches?: Match[]) => {
    setLoading(true);
    const targetMatches = newMatches || matches;
    const data = await getPredictionInsights(targetMatches);
    setInsights(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoundData();
  }, []);

  const handleAdminCheck = () => {
    if (adminPassword === 'degrauln77') {
      setIsAdminMode(true);
      setEditMatches(JSON.parse(JSON.stringify(matches)));
      setEditTitle(roundTitle);
      setAdminPassword('');
    } else {
      alert("Senha incorreta!");
    }
  };

  const saveManualRound = () => {
    setMatches(editMatches);
    setRoundTitle(editTitle);
    setBets([]);
    setIsAdminMode(false);
    setShowAdminModal(false);
    fetchRoundData(editMatches);
  };

  const handleUpdateMatch = (index: number, field: keyof Match, value: string) => {
    const updated = [...editMatches];
    updated[index] = { ...updated[index], [field]: value };
    setEditMatches(updated);
  };

  const handleSelect = (matchId: string, choice: BetOption) => {
    setBets(prev => {
      const existing = prev.find(b => b.matchId === matchId);
      if (existing?.choice === choice) {
        return prev.filter(b => b.matchId !== matchId);
      }
      const otherBets = prev.filter(b => b.matchId !== matchId);
      return [...otherBets, { matchId, choice }];
    });
  };

  const totalCostValue = (bets.length > 0 ? 2.0 : 0.0);
  const totalCostStr = totalCostValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSubmit = () => {
    if (bets.length < 3) {
      alert("Selecione pelo menos 3 jogos para validar sua cartela!");
      return;
    }
    setShowPixModal(true);
  };

  const handleWhatsApp = () => {
    const betDetails = bets.map(b => {
      const m = matches.find(match => match.id === b.matchId);
      return `${m?.homeTeam} vs ${m?.awayTeam}: ${b.choice}`;
    }).join('\n');
    
    const message = encodeURIComponent(
      `Olá! Gostaria de confirmar minha aposta na Rodada D'Grau.\n\n` +
      `Meus palpites:\n${betDetails}\n\n` +
      `Valor total: ${totalCostStr}\n` +
      `Estou enviando o comprovante do PIX abaixo.`
    );
    window.open(`https://wa.me/5598984595785?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-emerald-950 selection:bg-lime-400 selection:text-emerald-950 pb-32">
      {/* Header */}
      <header className="bg-emerald-800 border-b-4 border-emerald-900 py-8 px-4 flex flex-col items-center text-center shadow-lg relative">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center shadow-xl">
            <i className="fas fa-soccer-ball text-4xl text-emerald-900"></i>
          </div>
          <h1 className="text-5xl md:text-6xl font-black font-oswald tracking-tighter leading-none text-white">
            RODADA<br/>D'GRAU
          </h1>
        </div>
        <p className="text-lg md:text-xl font-bold tracking-widest text-emerald-200 mt-2 uppercase">
          DIA DE JOGO É DIA DE GANHAR
        </p>

        <button 
          onClick={() => setShowAdminModal(true)}
          className="absolute top-4 right-4 bg-emerald-700/50 hover:bg-emerald-600 text-[10px] font-bold py-2 px-3 rounded-lg border border-emerald-600 transition-all text-emerald-100 flex items-center gap-2"
        >
          <i className="fas fa-lock"></i>
          ADMIN
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-oswald uppercase font-bold text-white tracking-tight leading-tight">
              {roundTitle}
            </h2>
            <p className="text-emerald-400 font-medium">ESCOLHA: CASA / EMPATE / FORA</p>
          </div>
          <div className="bg-lime-400 text-emerald-950 px-6 py-2 rounded-full font-black text-xl animate-pulse shadow-xl shadow-lime-400/20">
            SOMENTE R$ 2,00
          </div>
        </div>

        {/* AI Insight Loading State */}
        {loading && (
          <div className="mb-6 p-4 bg-emerald-900/50 rounded-lg flex items-center gap-3 border border-lime-400/30">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-lime-400"></div>
            <span className="text-lime-400 text-sm font-bold">Atualizando inteligência da rodada...</span>
          </div>
        )}

        {/* Matches List */}
        <div className="space-y-4">
          {matches.map(match => (
            <BetCard
              key={match.id}
              match={match}
              selectedOption={bets.find(b => b.matchId === match.id)?.choice || BetOption.NONE}
              onSelect={(choice) => handleSelect(match.id, choice)}
              insight={insights.find(i => 
                i.matchId.toLowerCase().includes(match.homeTeam.toLowerCase()) || 
                match.homeTeam.toLowerCase().includes(i.matchId.toLowerCase())
              )}
            />
          ))}
        </div>

        {/* Footer Banner */}
        <div className="mt-12 p-8 bg-emerald-900/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-800">
          <div className="text-center md:text-left">
            <p className="text-2xl font-black font-oswald uppercase tracking-tight text-white italic">APOSTE, TORÇA E GANHE!!!</p>
            <p className="text-emerald-300 mt-2">Os melhores jogos da rodada estão aqui.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=RodadaDGrau&color=064e3b" 
                alt="QR Code" 
                className="w-24 h-24"
              />
            </div>
            <p className="text-[10px] uppercase font-bold text-emerald-500">BAIXE NOSSO APP</p>
          </div>
        </div>
      </main>

      {/* Admin/Manual Entry Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          {!isAdminMode ? (
            <div className="bg-emerald-900 border-2 border-lime-400 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-black font-oswald text-white mb-6 uppercase text-center italic">ACESSO ADMINISTRATIVO</h3>
              <input 
                type="password"
                placeholder="Senha de acesso"
                className="w-full p-4 bg-emerald-950 border border-emerald-700 rounded-xl text-white mb-4 text-center focus:border-lime-400 outline-none"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminCheck()}
              />
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleAdminCheck}
                  className="w-full bg-lime-400 text-emerald-950 py-3 rounded-xl font-black uppercase hover:bg-lime-300 transition-all"
                >
                  Entrar
                </button>
                <button 
                  onClick={() => setShowAdminModal(false)}
                  className="text-emerald-400 text-sm py-2 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-900 border-2 border-lime-400 rounded-3xl p-6 max-w-2xl w-full shadow-2xl my-8">
              <h3 className="text-2xl font-black font-oswald text-white mb-6 uppercase italic text-center">EDITAR RODADA</h3>
              
              <div className="mb-6">
                <label className="block text-[10px] text-emerald-400 uppercase font-bold mb-2">Título da Rodada / Data</label>
                <input 
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-4 bg-emerald-950 border border-emerald-700 rounded-xl text-white font-bold focus:border-lime-400 outline-none"
                  placeholder="Ex: Rodada de Domingo - 15/10"
                />
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mb-6 custom-scrollbar">
                {editMatches.map((m, idx) => (
                  <div key={idx} className="bg-emerald-950 p-4 rounded-xl border border-emerald-800 space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] uppercase font-bold text-emerald-600 ml-1">Mandante</label>
                        <input 
                          type="text" value={m.homeTeam} 
                          onChange={(e) => handleUpdateMatch(idx, 'homeTeam', e.target.value)}
                          className="w-full p-2 bg-emerald-900 border border-emerald-700 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] uppercase font-bold text-emerald-600 ml-1">Visitante</label>
                        <input 
                          type="text" value={m.awayTeam} 
                          onChange={(e) => handleUpdateMatch(idx, 'awayTeam', e.target.value)}
                          className="w-full p-2 bg-emerald-900 border border-emerald-700 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-24">
                        <label className="text-[9px] uppercase font-bold text-emerald-600 ml-1">Horário</label>
                        <input 
                          type="text" value={m.time} 
                          onChange={(e) => handleUpdateMatch(idx, 'time', e.target.value)}
                          className="w-full p-2 bg-emerald-900 border border-emerald-700 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] uppercase font-bold text-emerald-600 ml-1">Liga</label>
                        <input 
                          type="text" value={m.league} 
                          onChange={(e) => handleUpdateMatch(idx, 'league', e.target.value)}
                          className="w-full p-2 bg-emerald-900 border border-emerald-700 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsAdminMode(false)}
                  className="bg-emerald-800 text-emerald-300 py-3 rounded-xl font-bold uppercase hover:text-white transition-all"
                >
                  Voltar
                </button>
                <button 
                  onClick={saveManualRound}
                  className="bg-lime-400 text-emerald-950 py-3 rounded-xl font-black uppercase hover:bg-lime-300 transition-all shadow-lg"
                >
                  Salvar Rodada
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sticky Bottom Summary */}
      <footer className="fixed bottom-0 left-0 right-0 bg-emerald-950/95 backdrop-blur-md border-t border-emerald-800 p-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Palpites</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">{bets.length}</span>
              <span className="text-emerald-500 font-medium">jogos</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Total</span>
            <span className="text-2xl font-black text-white tracking-tight">{totalCostStr}</span>
          </div>
          <button
            onClick={handleSubmit}
            className={`
              px-8 py-3 rounded-xl font-black text-lg transition-all
              ${bets.length >= 3 
                ? 'bg-lime-400 text-emerald-950 hover:bg-lime-300 hover:scale-105 active:scale-95 shadow-lg shadow-lime-400/20' 
                : 'bg-emerald-900 text-emerald-700 cursor-not-allowed'}
            `}
          >
            FECHAR PALPITE
          </button>
        </div>
      </footer>

      {/* PIX MODAL */}
      {showPixModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-emerald-900 border-2 border-lime-400 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-money-bill-transfer text-emerald-900 text-2xl"></i>
              </div>
              <h3 className="text-3xl font-black font-oswald text-white uppercase italic">PAGAMENTO VIA PIX</h3>
              <p className="text-emerald-300 font-bold mt-2">Valor Total: {totalCostStr}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl mb-6 flex justify-center shadow-inner">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_98984595785&color=064e3b" 
                alt="PIX QR Code" 
                className="w-48 h-48"
              />
            </div>

            <div className="space-y-3 mb-8">
              <div className="bg-emerald-950/50 p-3 rounded-lg border border-emerald-800 text-center">
                <p className="text-[10px] text-emerald-500 uppercase font-black mb-1">Chave PIX (Celular)</p>
                <p className="text-xl font-bold text-white tracking-widest">98984595785</p>
              </div>
              <p className="text-xs text-center text-emerald-400 italic">
                Pague e envie o comprovante no botão abaixo para registrar seus palpites.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleWhatsApp}
                className="bg-lime-400 text-emerald-950 w-full py-4 rounded-xl font-black text-lg hover:bg-lime-300 transition-colors flex items-center justify-center gap-3 shadow-lg shadow-lime-400/20"
              >
                <i className="fab fa-whatsapp text-2xl"></i>
                ENVIAR COMPROVANTE
              </button>
              <button
                onClick={() => setShowPixModal(false)}
                className="text-emerald-400 font-bold py-2 text-sm hover:text-white transition-colors"
              >
                VOLTAR PARA APOSTA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
