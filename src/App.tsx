import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  User, 
  ArrowLeft,
  Printer,
  ChevronRight,
  RotateCcw,
  Check,
  Award,
  BookOpen,
  Dice5,
  Sparkles,
  Trash2,
  Eye,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { MOCK_GAMES, APP_NAME, TICKET_PRICE, GRAND_PRIZE, WHATSAPP_NUMBER, DEADLINE } from './constants';
import { BetChoice, Ticket, Bet, Game } from './types';
import { cn, generateTicketCode } from './lib/utils';
const motorcycleImage = "/src/assets/images/generic_sporty_bike_1779545990722.png";

// Dynamic precise QR builder for digital validation
function DynamicQRCode({ text }: { text: string }) {
  const size = 25;
  const grid = Array.from({ length: size }, (_, y) => 
    Array.from({ length: size }, (_, x) => {
      const isFinderPattern = 
        (x < 7 && y < 7) || 
        (x > size - 8 && y < 7) || 
        (x < 7 && y > size - 8);
        
      if (isFinderPattern) {
        const outer = (x === 0 || x === 6 || y === 0 || y === 6) && 
                      (x >= 0 && x <= 6 && y >= 0 && y <= 6);
        const outerRight = (x === size - 7 || x === size - 1 || y === 0 || y === 6) && 
                           (x >= size - 7 && x < size && y >= 0 && y <= 6);
        const outerBottom = (x === 0 || x === 6 || y === size - 7 || y === size - 1) && 
                            (x >= 0 && x <= 6 && y >= size - 7 && y < size);
        
        const inner = (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        const innerRight = (x >= size - 5 && x <= size - 3 && y >= 2 && y <= 4);
        const innerBottom = (x >= 2 && x <= 4 && y >= size - 5 && y <= size - 3);

        return outer || outerRight || outerBottom || inner || innerRight || innerBottom;
      }
      
      const hash = text.split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
      return ((x * y + hash + (x + y)) % 3 === 0);
    })
  );

  return (
    <div className="bg-white p-2 text-black rounded-xl inline-block shadow-sm border border-zinc-200">
      <div className="grid grid-cols-25 gap-[0.5px] bg-white aspect-square w-24 h-24 sm:w-28 sm:h-28">
        {grid.flatMap((row, y) => 
          row.map((active, x) => (
            <div 
              key={`${y}-${x}`} 
              className={cn(
                "w-full h-full", 
                active ? "bg-black" : "bg-transparent"
              )} 
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function App() {
  const appName = APP_NAME;
  const ticketPrice = TICKET_PRICE;
  const grandPrize = GRAND_PRIZE;
  const whatsappNumber = WHATSAPP_NUMBER;
  const deadlineText = DEADLINE;

  // List of games
  const gamesList = MOCK_GAMES;

  // Persistent ticket history state
  const [savedTickets, setSavedTickets] = useState<Ticket[]>(() => {
    try {
      const data = localStorage.getItem('dgrau_apostas_saved_tickets');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  // Slipped-ticket state variables
  const [bets, setBets] = useState<Bet[]>([]);
  const [name, setName] = useState('');
  const [alphanumericCode, setAlphanumericCode] = useState(() => generateTicketCode());
  const [ticketDate, setTicketDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);
  
  // Toggle printed layouts
  const [printLayoutMode, setPrintLayoutMode] = useState<'flyer' | 'thermal'>('flyer');

  // Interactive Match Options Choice handler
  const handleSelect = (gameId: number, choice: BetChoice) => {
    setBets((prev) => {
      const filtered = prev.filter((b) => b.gameId !== gameId);
      const exists = prev.find((b) => b.gameId === gameId && b.choice === choice);
      if (exists) {
        return filtered; // If clicked again, deselect option
      }
      return [...filtered, { gameId, choice }];
    });
  };

  // Surpresinha custom fill
  const handleRandomFill = () => {
    const randomChoices: BetChoice[] = ['CASA', 'EMPATE', 'FORA'];
    const newBets: Bet[] = gamesList.map((game) => ({
      gameId: game.id,
      choice: randomChoices[Math.floor(Math.random() * 3)]
    }));
    setBets(newBets);
  };

  const handleClearBets = () => {
    setBets([]);
  };

  // Refresh code
  const handleRegenerateCode = () => {
    setAlphanumericCode(generateTicketCode());
  };

  // Validate code formatting (6 alphanumeric characters)
  const handleAlphanumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setAlphanumericCode(value);
    }
  };

  // Delete ticket from persistent memory
  const handleDeleteTicket = (ticketId: string) => {
    setSavedTickets((prev) => {
      const updated = prev.filter((t) => t.id !== ticketId);
      try {
        localStorage.setItem('dgrau_apostas_saved_tickets', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to update localStorage:", err);
      }
      return updated;
    });
    if (generatedTicket?.id === ticketId) {
      setGeneratedTicket(null);
    }
  };

  // Issue ticket 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Atenção: Por favor, insira o seu Nome Completo para registrar o bilhete!');
      return;
    }
    if (alphanumericCode.length < 6) {
      alert('Atenção: O código alfanumérico deve conter exatamente 6 dígitos!');
      return;
    }
    if (bets.length < 12) {
      const remaining = 12 - bets.length;
      alert(`Atenção: Preencha todos os marcadores! Faltam palpites para ${remaining} partida(s).`);
      return;
    }

    const ticket: Ticket = {
      id: crypto.randomUUID(),
      buyerName: name.trim().toUpperCase(),
      buyerPhone: '(Validação via Código)',
      bets: [...bets].sort((a, b) => a.gameId - b.gameId),
      date: new Date().toISOString(),
      price: ticketPrice,
      code: alphanumericCode.toUpperCase(),
    };

    setSavedTickets((prev) => {
      const updated = [ticket, ...prev];
      try {
        localStorage.setItem('dgrau_apostas_saved_tickets', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to write ticket queue:", err);
      }
      return updated;
    });

    setGeneratedTicket(ticket);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to editor and reset states
  const handleResetAll = () => {
    setBets([]);
    setName('');
    setAlphanumericCode(generateTicketCode());
    setGeneratedTicket(null);
  };

  const getChoiceLabel = (choice: BetChoice) => {
    if (choice === 'CASA') return 'C';
    if (choice === 'EMPATE') return 'E';
    return 'F';
  };

  // WhatsApp message generator
  const handleWhatsAppShare = (ticket: Ticket) => {
    const formattedDate = format(new Date(), 'dd/MM/yyyy HH:mm');
    
    let betLines = '';
    gamesList.forEach((game, idx) => {
      const bet = ticket.bets.find((b) => b.gameId === game.id);
      const choiceLabel = bet ? getChoiceLabel(bet.choice) : 'NÃO MARCADO';
      betLines += `• JOGO ${String(idx + 1).padStart(2, '0')}: ${game.homeTeam} x ${game.awayTeam} → [ *${choiceLabel}* ]%0A`;
    });

    const text = `*${appName.toUpperCase()} - REGISTRO DE BILHETE*%0a` +
                 `====================================%0a` +
                 `🎟️ *CÓDIGO DE SORTEIO:* ${ticket.code}%0a` +
                 `👤 *APOSTADOR:* ${ticket.buyerName}%0a` +
                 `📅 *DATA DE EMISSÃO:* ${formattedDate}%0a` +
                 `💵 *NÚMERO DE JOGOS:* 12 PARTIDAS COMPLETAS%0a` +
                 `💵 *CUSTO DO PRODUTO:* R$ ${ticketPrice.toFixed(2).replace('.', ',')}%0a` +
                 `🏆 *CASO ACERTE TODAS:* R$ ${grandPrize}%0a` +
                 `🏍️ *CASO NÃO ACERTE:* Concorre à MOTO 0 KM com o código acima!%0a` +
                 `====================================%0a` +
                 `⚽ *PALPITES REGISTRADOS:*%0a${betLines}%0a` +
                 `====================================%0a` +
                 `*Olá Operador! Favor validar e autenticar meu bilhete ${ticket.code} no sistema D'grau Apostas.*`;

    window.open(`https://wa.me/55${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#071307] bg-[radial-gradient(#153515_1px,transparent_1px)] [background-size:24px_24px] text-white py-4 md:py-8 px-2 sm:px-4 flex flex-col items-center justify-start select-none">
      
      {/* BRAND BAR BANNER */}
      <div className="w-full max-w-4xl bg-black/60 backdrop-blur-md border border-green-500/20 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 no-print shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-emerald-500 shadow-[0_0_15px_rgba(190,252,23,0.3)] animate-pulse">
            <svg viewBox="0 0 512 512" className="w-8 h-8 text-black" fill="currentColor">
              <path d="M256 0c141.4 0 256 114.6 256 256S397.4 512 256 512S0 397.4 0 256S114.6 0 256 0zM390.6 246.7c11.2-13.4 9.4-33.3-4-44.5s-33.3-9.4-44.5 4l-44.5 53.4-35.6-28.5c-12.5-10-30.8-8.1-40.8 4.4s-8.1 30.8 4.4 40.8l53.3 42.7c12 9.6 29.2 8.7 40.2-2.1L390.6 246.7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-1 font-display uppercase italic text-white">
              {appName.split(' ')[0]} <span className="text-[#befc17]">{appName.split(' ').slice(1).join(' ') || 'Apostas'}</span>
            </h1>
            <p className="text-[10px] text-emerald-400/90 font-black tracking-widest">SISTEMA OFICIAL DE EMISSÃO DE BILHETES LOTECA</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#102410] border border-green-500/20 rounded-xl px-3 py-1 flex items-center gap-2">
            <Calendar className="text-[#befc17] w-4 h-4" />
            <div className="text-left">
              <p className="text-[8px] text-zinc-400 uppercase font-black tracking-wider leading-none">Rodada Atual</p>
              <p className="text-[11px] font-bold text-white mt-0.5 leading-none">{deadlineText}</p>
            </div>
          </div>
          
          <div className="bg-[#122e12] border border-[#befc17]/30 rounded-xl px-3 py-1 flex items-center gap-2">
            <Trophy className="text-[#befc17] w-4 h-4" />
            <div className="text-left">
              <p className="text-[8px] text-[#befc17] uppercase font-black tracking-wider leading-none">Prêmio Principal</p>
              <p className="text-[11px] font-black text-[#befc17] mt-0.5 leading-none">R$ {grandPrize}</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!generatedTicket ? (
          <motion.div
            key="ticket-card-editor"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-4xl no-print"
          >
            {/* INTERACTIVE CONTROLLER ACTIONS BANNER */}
            <div className="bg-emerald-950/40 border border-green-500/20 text-white p-3 rounded-2xl mb-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎲</span>
                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#befc17]">Painel Interativo de Palpites</h4>
                  <p className="text-[10px] text-zinc-300 font-medium">Preencha rapidamente seus palpites ou limpe a cartela para refazer.</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <button 
                  type="button" 
                  onClick={handleRandomFill}
                  className="flex-1 sm:flex-none bg-[#befc17] text-black py-2 px-3.5 rounded-xl text-xs font-black hover:bg-[#a9e414] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Dice5 size={14} />
                  <span>Surpresinha</span>
                </button>
                <button 
                  type="button" 
                  onClick={handleClearBets}
                  className="flex-1 sm:flex-none bg-zinc-800 text-zinc-350 hover:bg-zinc-700 py-2 px-3 rounded-xl text-xs font-black hover:text-white active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Limpar</span>
                </button>
              </div>
            </div>

            {/* REAL PHYSICAL CARD REPLICATED */}
            <div className="w-full bg-[#f6f5f0] text-black shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-[2.5rem] border-4 border-dashed border-zinc-450 p-2 sm:p-4 overflow-hidden relative">
              
              {/* Outer decorative dotted cut line helper */}
              <div className="absolute top-0 left-0 w-full flex items-center gap-2 px-8 py-2 opacity-35">
                <span className="text-[10px] font-mono font-black text-zinc-500">CORTE AQUI</span>
                <div className="flex-1 border-t-2 border-dotted border-zinc-400"></div>
                <span className="text-zinc-500">✂️</span>
                <div className="flex-1 border-t-2 border-dotted border-zinc-400"></div>
              </div>

              {/* STYLIZED HEADER BANNER IN GREEN/BLACK */}
              <div className="mt-4 bg-[#0a0f0a] rounded-[2rem] p-4 sm:p-6 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 border-b-8 border-[#befc17] shadow-lg">
                
                {/* Football textured dynamic line layout background */}
                <div className="absolute inset-0 bg-[radial-gradient(#1f401f_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                <div className="absolute -left-10 bottom-0 w-64 h-32 bg-gradient-to-tr from-green-600/20 to-transparent blur-2xl" />
                
                {/* Left soccer ball + Logo titles */}
                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 text-center sm:text-left">
                  {/* Soccer ball layout */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-full bg-[#befc17]/25 blur-xl animate-pulse" />
                    {/* Classic leather panels football polygon layout */}
                    <svg viewBox="0 0 512 512" className="w-20 h-20 sm:w-24 sm:h-24 text-white relative drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] transition-all hover:rotate-12 duration-500" fill="currentColor">
                      <path d="M256 0a256 256 0 1 0 0 512 256 256 0 1 0 0-512zm135.2 147l-41.5 5.5-27.1-31.6L256 100l-66.6 20.9-27.1 31.6-41.5-5.5 14.1 63.8L183.3 256l-48.4 45.2-14.1 63.8 41.5-5.5 27.1 31.6L256 412l66.6-20.9 27.1-31.6 41.5 5.5-14.1-63.8L328.7 256l48.4-45.2 14.1-63.8zM256 160a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display font-black text-5xl sm:text-6xl tracking-tighter uppercase italic leading-none text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                      D'GRAU
                    </h2>
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-[#befc17] tracking-widest mt-0.5 uppercase flex items-center justify-center sm:justify-start gap-1 leading-none">
                      <span className="text-white text-lg">★</span> APOSTAS <span className="text-white text-lg">★</span>
                    </h3>
                  </div>
                </div>

                {/* Right side dynamic banner slogan stamp */}
                <div className="relative z-10 bg-[#162e16] border border-[#befc17]/30 py-2.5 px-5 rounded-2xl shadow-inner text-center">
                  <p className="font-display font-bold text-xs text-[#befc17] uppercase tracking-widest">ESCOLHA, ACREDITE</p>
                  <p className="font-display font-black text-lg italic text-white uppercase tracking-wider mt-0.5 leading-none">E BOA SORTE!</p>
                </div>
              </div>

              {/* INPUT FIELDS SECTION: NOME DO CLIENTE & DIGITS CODE */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#e8e6df] p-4 rounded-[1.5rem] border border-zinc-300">
                {/* Client name input box (rounded) */}
                <div className="md:col-span-7 flex flex-col gap-1.5 text-left">
                  <label htmlFor="customer-name-input" className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-1">
                    <User size={13} className="text-[#0e290f]" />
                    Nome do Cliente:
                  </label>
                  <input 
                    id="customer-name-input"
                    type="text"
                    placeholder="DIGITE O NOME COMPLETO DO CLIENTE"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white h-12 border-2 border-zinc-300 rounded-xl px-4 text-sm font-black uppercase text-zinc-900 tracking-tight placeholder:text-zinc-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Alphanumeric code box of 6 characters */}
                <div className="md:col-span-5 flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-center">
                    <label htmlFor="alphanumeric-code-input" className="text-xs font-black text-zinc-800 uppercase tracking-widest flex items-center gap-1 leading-none">
                      <span className="text-[#0e290f]">🎟️</span>
                      Código Alfanumérico (6 Dígitos)
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      className="text-[10px] font-black text-emerald-800 hover:text-emerald-950 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      title="Gerar código aleatório"
                    >
                      <Dice5 size={12} />
                      Gerar Código
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      id="alphanumeric-code-input"
                      type="text"
                      placeholder="EX: A7K9Z4"
                      value={alphanumericCode}
                      onChange={handleAlphanumericChange}
                      maxLength={6}
                      className="w-full bg-white h-12 border-2 border-zinc-300 rounded-xl px-4 text-center font-mono text-xl font-extrabold uppercase text-emerald-950 tracking-[0.25em] outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SELECTION AREA SPLIT ROWS AND CARDS BAR */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                
                {/* LEFT BLOCK: THE 12 MATCHES DRAW SHEET TABLE */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="font-display font-black text-sm uppercase text-zinc-800 tracking-wider flex items-center gap-1.5">
                      <span className="text-green-700">⚽</span> MARQUE SUA OPÇÃO PARA CADA PARTIDA
                    </h4>
                  </div>

                  {/* Loteca coupon matches container */}
                  <div className="rounded-2xl overflow-hidden border-2 border-black bg-white shadow-md">
                    <table className="w-full text-xs font-bold leading-none border-collapse">
                      <thead>
                        <tr className="bg-[#115e24] text-white text-[11px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 text-center w-10 border-r border-[#154620]">Nº</th>
                          <th className="py-2.5 px-3 text-left">PARTIDAS</th>
                          <th className="py-2.5 px-1 text-center w-12 sm:w-16 border-l border-[#154620]">CASA</th>
                          <th className="py-2.5 px-1 text-center w-12 sm:w-16 border-l border-[#154620]">EMPATE</th>
                          <th className="py-2.5 px-1 text-center w-12 sm:w-16 border-l border-[#154620]">FORA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gamesList.map((game, index) => {
                          const userBet = bets.find((b) => b.gameId === game.id);
                          
                          return (
                            <tr 
                              key={game.id} 
                              className={cn(
                                "border-b border-zinc-200 transition-all",
                                userBet ? "bg-emerald-50" : "even:bg-[#fbfaf6] hover:bg-zinc-100/60"
                              )}
                            >
                              {/* Round Number */}
                              <td className="py-3 px-2 text-center font-mono font-black text-sm text-green-700 border-r border-zinc-200">
                                {String(index + 1).padStart(2, '0')}
                              </td>

                              {/* Game matchup names */}
                              <td className="py-3 px-3 text-left">
                                <div className="flex items-center gap-1.5 sm:gap-2 leading-tight">
                                  <span className="tracking-tight text-xs sm:text-[13px] text-zinc-900 font-extrabold uppercase">
                                    {game.homeTeam}
                                  </span>
                                  <span className="text-zinc-400 font-black text-[9px] sm:text-[10px] px-1 md:px-1.5 bg-zinc-150/80 rounded-full select-none border border-zinc-200">
                                    X
                                  </span>
                                  <span className="tracking-tight text-xs sm:text-[13px] text-zinc-900 font-extrabold uppercase">
                                    {game.awayTeam}
                                  </span>
                                </div>
                              </td>

                              {/* CASA SELECTION BUTTON */}
                              <td className="py-2 px-1 text-center border-l border-zinc-200 w-12 sm:w-16">
                                <button
                                  type="button"
                                  onClick={() => handleSelect(game.id, 'CASA')}
                                  className="mx-auto w-8 h-8 rounded-full flex items-center justify-center transition-all bg-zinc-50 border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-800 cursor-pointer"
                                >
                                  {userBet?.choice === 'CASA' ? (
                                    <div className="w-6 h-6 rounded-full bg-[#115e24] flex items-center justify-center text-white scale-110 shadow-md">
                                      <span className="font-mono font-black text-sm text-[#befc17]">X</span>
                                    </div>
                                  ) : (
                                    <span className="font-mono text-zinc-300 font-extrabold text-[10px]">C</span>
                                  )}
                                </button>
                              </td>

                              {/* EMPATE SELECTION BUTTON */}
                              <td className="py-2 px-1 text-center border-l border-zinc-200 w-12 sm:w-16">
                                <button
                                  type="button"
                                  onClick={() => handleSelect(game.id, 'EMPATE')}
                                  className="mx-auto w-8 h-8 rounded-full flex items-center justify-center transition-all bg-zinc-50 border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-800 cursor-pointer"
                                >
                                  {userBet?.choice === 'EMPATE' ? (
                                    <div className="w-6 h-6 rounded-full bg-[#115e24] flex items-center justify-center text-white scale-110 shadow-md">
                                      <span className="font-mono font-black text-sm text-[#befc17]">X</span>
                                    </div>
                                  ) : (
                                    <span className="font-mono text-zinc-300 font-extrabold text-[10px]">E</span>
                                  )}
                                </button>
                              </td>

                              {/* FORA SELECTION BUTTON */}
                              <td className="py-2 px-1 text-center border-l border-zinc-200 w-12 sm:w-16">
                                <button
                                  type="button"
                                  onClick={() => handleSelect(game.id, 'FORA')}
                                  className="mx-auto w-8 h-8 rounded-full flex items-center justify-center transition-all bg-zinc-50 border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-800 cursor-pointer"
                                >
                                  {userBet?.choice === 'FORA' ? (
                                    <div className="w-6 h-6 rounded-full bg-[#115e24] flex items-center justify-center text-white scale-110 shadow-md">
                                      <span className="font-mono font-black text-sm text-[#befc17]">X</span>
                                    </div>
                                  ) : (
                                    <span className="font-mono text-zinc-300 font-extrabold text-[10px]">F</span>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* TALLY STATE HEADER FOR CLIENT SAFETY */}
                  <div className="flex justify-between items-center bg-zinc-200 border border-zinc-300 p-3 rounded-2xl text-[10.5px] font-black uppercase text-zinc-800 tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className={cn(bets.length === 12 ? "text-emerald-700" : "text-zinc-500")} />
                      Progresso da Cartela:
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-xl text-white text-xs font-mono font-black transition-all",
                      bets.length === 12 ? "bg-emerald-700 animate-pulse shadow" : "bg-zinc-950"
                    )}>
                      {bets.length} DE 12 JOGOS MARCADOS
                    </span>
                  </div>
                </div>

                {/* RIGHT BLOCK: THE TWO GORGEOUS FLYER BLACK CARDS (PRICES + MOTO) */}
                <div className="lg:col-span-4 flex flex-col justify-start gap-4">
                  
                  {/* CARD 1: APOUSTA R$ 2,00 */}
                  <div className="bg-[#0f1210] text-[#befc17] rounded-[2rem] p-5 border-4 border-black border-double shadow-lg select-none text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[190px]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/10 to-transparent blur-xl pointer-events-none" />
                    
                    <h4 className="font-display font-bold text-lg text-white leading-none uppercase tracking-widest">
                      APOSTA
                    </h4>
                    <p className="font-display font-black text-5xl sm:text-6xl text-[#befc17] tracking-tight mt-1 animate-pulse select-all drop-shadow-[0_4px_12px_rgba(190,252,23,0.3)]">
                      R$ 2,00
                    </p>

                    <div className="w-full border-t border-zinc-750/75 my-3" />

                    <p className="font-display font-bold text-xs uppercase tracking-widest text-[#befc17]">
                      ACERTOU AS 12?
                    </p>
                    <span className="inline-block bg-[#befc17] text-black font-extrabold text-[10px] tracking-widest px-2.5 py-0.5 rounded-full mt-1 uppercase">
                      ★ GANHE ★
                    </span>
                    <p className="font-display font-black text-3xl sm:text-4xl text-white tracking-wide mt-1.5 select-all">
                      R$ 1.000,00
                    </p>

                    <div className="mt-2.5 text-[8px] font-black uppercase text-zinc-400 tracking-[0.15em] flex items-center gap-1 justify-center leading-none">
                      💰 RECEBIMENTO IMEDIATO COM O OPERADOR
                    </div>
                  </div>

                  {/* CARD 2: CONCORRA A MOTO 0 KM */}
                  <div className="bg-[#0f1210] text-white rounded-[2rem] p-5 border-4 border-zinc-700 shadow-lg text-center relative overflow-hidden flex flex-col items-center justify-between min-h-[290px] flex-1">
                    
                    {/* Header alignment bar */}
                    <div className="w-full text-center">
                      <h4 className="font-display font-black text-sm uppercase text-[#befc17] tracking-widest leading-none">
                        NÃO ACERTOU TODAS?
                      </h4>
                      <p className="text-[10px] font-extrabold uppercase text-zinc-300 mt-1 leading-tight tracking-wide">
                        INSIRA SEU CÓDIGO DO BILHETE <br/>
                        <strong className="text-white bg-emerald-950/80 px-2 py-0.5 rounded border border-green-500/15 mt-0.5 inline-block select-none">
                          ★ E CONCORRA A ★
                        </strong>
                      </p>
                    </div>

                    {/* Big center text */}
                    <div className="my-2.5 w-full text-center relative z-10">
                      <p className="font-display font-black text-4xl sm:text-5xl italic tracking-tight uppercase leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] text-white">
                        1 MOTO
                      </p>
                      <p className="font-display font-black text-5xl sm:text-6xl italic tracking-tight uppercase leading-none text-[#befc17] drop-shadow-[0_4px_10px_rgba(190,252,23,0.3)] mt-1.5">
                        0 KM
                      </p>
                    </div>

                    {/* High quality rendered Sporty Motorcycle overlapped image */}
                    <div className="w-full h-32 relative select-none">
                      <div className="absolute inset-0 bg-radial from-[#befc17]/10 to-transparent rounded-full blur-xl pointer-events-none" />
                      <img 
                        src={motorcycleImage} 
                        alt="Promoção Moto Honda 160cc okm"
                        className="w-full h-full object-contain object-bottom scale-110 hover:scale-120 drop-shadow-[0_15px_15px_rgba(0,0,0,0.9)] transition-transform duration-350"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Badge details */}
                    <p className="text-[9px] font-black tracking-widest uppercase text-zinc-400 mt-2 leading-none relative z-10">
                      🏍️ SORTEIO REALIZADO NO FINAL DA PROMOÇÃO
                    </p>
                  </div>

                </div>

              </div>

              {/* FOOTER DESCRIPTIVE COLUMNS IN ORIGINAL FLYER (COMO FUNCIONA / PREMIAÇÃO) */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-zinc-300 pt-5 text-left text-zinc-800">
                {/* How it works column */}
                <div className="flex gap-2.5 items-start bg-white/70 p-3.5 rounded-2xl border border-zinc-200/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <BookOpen size={16} className="text-emerald-800" />
                  </div>
                  <div>
                    <h5 className="font-display font-black text-xs uppercase tracking-wide text-zinc-950">COMO FUNCIONA</h5>
                    <p className="text-[10px] sm:text-[11px] leading-relaxed text-zinc-600 mt-1 font-semibold">
                      Marque 1 opção em cada partida: <strong className="text-emerald-950">CASA</strong>, <strong className="text-emerald-950">EMPATE</strong> ou <strong className="text-emerald-950">FORA</strong>. Preencha seu nome e um número WhatsApp do operador.
                    </p>
                  </div>
                </div>

                {/* Main prize column */}
                <div className="flex gap-2.5 items-start bg-white/70 p-3.5 rounded-2xl border border-zinc-200/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Trophy size={16} className="text-emerald-800" />
                  </div>
                  <div>
                    <h5 className="font-display font-black text-xs uppercase tracking-wide text-zinc-950">PRÊMIO PRINCIPAL</h5>
                    <p className="text-[10px] sm:text-[11px] leading-relaxed text-zinc-600 mt-1 font-semibold">
                      Acertando todas as 12 partidas esportivas preenchidas na cartela, você leva o super prêmio acumulado de:
                    </p>
                    <span className="inline-block bg-[#115e24] text-[#befc17] font-display font-black text-xs px-2.5 py-1 rounded-xl mt-1.5 shadow select-all leading-none">
                      R$ {grandPrize} COM 12 ACERTOS!
                    </span>
                  </div>
                </div>

                {/* Raffle code column */}
                <div className="flex gap-2.5 items-start bg-white/70 p-3.5 rounded-2xl border border-zinc-200/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Award size={16} className="text-emerald-800" />
                  </div>
                  <div>
                    <h5 className="font-display font-black text-xs uppercase tracking-wide text-zinc-950">SORTEIO DA MOTO 0 KM</h5>
                    <p className="text-[10px] sm:text-[11px] leading-relaxed text-zinc-600 mt-1 font-semibold">
                      Caso não acerte todos os 12 palpites, guarde o código impresso de 6 caracteres. Pelo código do bilhete você concorre a uma <strong className="text-zinc-950">MOTO CG TITAN okm</strong>!
                    </p>
                  </div>
                </div>
              </div>

              {/* LOWER SCISSORS DECORATIVE FOOTER COMPROMISE */}
              <div className="mt-8 bg-[#115e24] text-white p-3.5 rounded-2xl flex items-center justify-center gap-3 border shadow-md relative group select-none">
                <span className="text-[#befc17] text-sm animate-bounce">★</span>
                <p className="font-display font-black tracking-widest text-xs uppercase italic text-center text-white">
                  APOSTOU, TORCEU, GANHOU!
                </p>
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-black shrink-0 border border-green-800">
                  ⚽
                </div>
                <p className="font-display font-black tracking-widest text-xs uppercase italic text-center text-[#befc17]">
                  VÁLIDO EM TODO O BRASIL!
                </p>
                <span className="text-[#befc17] text-sm animate-bounce">★</span>
              </div>

              {/* Scissors cutting dashed footer bottom */}
              <div className="absolute bottom-0 left-0 w-full flex items-center gap-2 px-8 py-2 opacity-35">
                <div className="flex-1 border-t-2 border-dotted border-zinc-400"></div>
                <span className="text-zinc-500">✂️</span>
                <div className="flex-1 border-t-2 border-dotted border-zinc-400"></div>
                <span className="text-[10px] font-mono font-black text-zinc-500">CORTE AQUI</span>
              </div>

            </div>

            {/* BIG EMIT BILL ACTION BUTTON FOR THE OPERATOR */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-[#115e24] hover:bg-[#0b4219] text-[#befc17] font-display font-black text-xl italic py-5 rounded-2xl flex items-center justify-center gap-2.5 shadow-[0_15px_35px_rgba(17,94,36,0.3)] border-b-4 border-black hover:scale-[1.005] active:scale-95 active:border-b-2 transition-all cursor-pointer uppercase tracking-wider"
              >
                Emitir Cupom do Cliente
                <ChevronRight size={22} className="text-[#befc17]" />
              </button>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="ticket-result-printable-panel"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-2xl mx-auto"
          >
            {/* GO BACK AND TOGGLE HEADING */}
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print">
              <button 
                onClick={handleResetAll}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors uppercase font-black tracking-widest text-xs cursor-pointer"
              >
                <ArrowLeft size={16} className="text-[#befc17]" />
                Registrar Nova Cartela (Limpar)
              </button>

              {/* SWITCH TEMPLATES BAR */}
              <div className="flex items-center bg-[#102410]/95 p-1.5 rounded-xl border border-green-500/20 gap-1.5 text-xs shadow-md">
                <span className="text-zinc-400 uppercase font-black px-1 text-[8.5px] tracking-wide">Modelo:</span>
                <button
                  type="button"
                  onClick={() => setPrintLayoutMode('flyer')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg uppercase tracking-wider font-extrabold transition cursor-pointer text-[9.5px]",
                    printLayoutMode === 'flyer' ? "bg-[#befc17] text-black font-black shadow-sm" : "text-white/60 hover:text-white"
                  )}
                >
                  🎫 Bilhete Digital (Flyer)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLayoutMode('thermal')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg uppercase tracking-wider font-extrabold transition cursor-pointer text-[9.5px]",
                    printLayoutMode === 'thermal' ? "bg-[#befc17] text-black font-black shadow-sm" : "text-white/60 hover:text-white"
                  )}
                >
                  📟 Térmica 80mm (Bobina)
                </button>
              </div>
            </div>

            {/* DUAL RENDERER ENGINE HOUSING OUTLET */}
            <div className={cn(
              "bg-white text-black p-1 sm:p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative rounded-2xl border border-zinc-200 mx-auto transition-all duration-350",
              printLayoutMode === 'thermal' ? "max-w-[430px]" : "max-w-2xl"
            )}>
              
              {/* Cutting dotted line representation */}
              <div className="absolute top-0 left-0 w-full flex items-center gap-2 px-6 -translate-y-1/2 opacity-35 no-print">
                <span className="text-[14px]">✂️</span>
                <div className="flex-1 border-t-2 border-dashed border-zinc-400"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-620">Via do Cliente</span>
                <div className="flex-1 border-t-2 border-dashed border-zinc-400"></div>
              </div>

              {/* RENDER A: grayscale thermal receipt */}
              {printLayoutMode === 'thermal' ? (
                <div className="thermal-ticket-print border border-zinc-400 p-4 sm:p-6 flex flex-col font-mono text-xs text-black bg-white select-text">
                  
                  {/* Grayscale POS Header */}
                  <div className="text-center border-b border-dashed border-black pb-3 space-y-1">
                    <h3 className="font-sans font-black text-2xl uppercase tracking-tighter leading-none">
                      {appName.toUpperCase()}
                    </h3>
                    <p className="text-[9.5px] font-bold leading-tight uppercase text-zinc-650">Comprovante Eletrônico de Palpites</p>
                    <p className="text-[8.5px] font-medium uppercase text-zinc-500">Data Impressão: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
                    <p className="text-[9px] font-bold mt-1">NÚMERO DE RECEPTOR: (55) {whatsappNumber}</p>
                  </div>

                  {/* Coupon Meta info */}
                  <div className="py-3 border-b border-dashed border-zinc-600 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="font-bold">SISTEMA STATUS:</span>
                      <span className="font-black bg-black text-white px-1 uppercase text-[9px]">VÁLIDO OPERADOR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">CÓDIGO SORTEIO:</span>
                      <span className="font-black bg-zinc-200 border border-black/20 px-1.5 text-xs font-mono">{generatedTicket.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">APOSTADOR (NOME):</span>
                      <span className="font-black uppercase truncate max-w-[170px]">{generatedTicket.buyerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">VALOR DO BILHETE:</span>
                      <span className="font-black">R$ {ticketPrice.toFixed(2).replace('.', ',')} (PAGO)</span>
                    </div>
                  </div>

                  {/* Matches header banner */}
                  <div className="py-2.5 font-black text-center text-[10px] bg-zinc-100 uppercase tracking-widest mb-2 border-b border-black">
                    A P O S T A S   F O R M U L A D A S
                  </div>

                  {/* Match grid in monospace styling */}
                  <div className="space-y-1 text-[11px] border-b border-dashed border-zinc-600 pb-3">
                    {gamesList.map((game, index) => {
                      const bet = generatedTicket.bets.find((b) => b.gameId === game.id);
                      return (
                        <div key={game.id} className="flex justify-between items-center py-1 border-b border-dotted border-zinc-200">
                          <span className="truncate max-w-[280px] text-zinc-900 font-bold">
                            [{String(index + 1).padStart(2, '0')}] {game.homeTeam} x {game.awayTeam}
                          </span>
                          <span className="font-black bg-zinc-950 text-white font-mono px-2 py-0.5 rounded leading-none shrink-0 text-center min-w-[24px]">
                            {bet ? getChoiceLabel(bet.choice) : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Prize descriptions */}
                  <div className="mt-3 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span>CUSTO BILHETE:</span>
                      <span className="font-black text-right">R$ {ticketPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PREMIAÇÃO 12 ACERTOS:</span>
                      <span className="font-black text-right text-emerald-950">R$ {grandPrize} ADIANTADO</span>
                    </div>
                    
                    <div className="bg-zinc-100 p-2 rounded text-[9.5px] text-center font-bold font-sans mt-2 leading-snug border border-zinc-200">
                      🏍️ CONCORRENDO AO SORTEIO DA MOTO HONDA CONSOLE 160cc 0KM CASO NÃO ACERTE AS 12 PARTIDAS!
                    </div>
                  </div>

                  {/* Web instructions check */}
                  <div className="mt-4 p-2 bg-zinc-50 border border-dotted border-zinc-400 rounded text-[9px] text-center font-bold no-print">
                    💡 Perfeito para impressoras térmicas Bluetooth de 58mm ou 80mm de rolo POS.
                  </div>

                  {/* QR validator block */}
                  <div className="mt-5 flex flex-col items-center justify-center space-y-1 border-t border-dashed border-zinc-400 pt-3">
                    <DynamicQRCode text={`D'GRAU-APOSTAS-CODE:${generatedTicket.code}-BUYER:${generatedTicket.buyerName}`} />
                    <p className="text-[8px] font-mono tracking-widest text-zinc-500 font-bold uppercase mt-1">VERIFICAÇÃO DIGITAL QR CODE</p>
                  </div>

                  {/* Barcode representation */}
                  <div className="mt-4 w-full flex flex-col items-center">
                    <div className="h-8 w-full bg-[repeating-linear-gradient(90deg,#000,#000_1px,transparent_1px,transparent_4px)] opacity-90" />
                    <p className="text-[9px] font-mono font-black mt-1 tracking-widest">{generatedTicket.code}-12PARTIDAS</p>
                  </div>

                  {/* Footer message stamp */}
                  <div className="mt-5 text-center text-[10px] font-black uppercase text-black border-t border-dashed border-black pt-3">
                    <p>OBRIGADO E BOA SORTE!</p>
                    <p className="text-[8px] text-zinc-500 font-bold mt-0.5">{appName.toUpperCase()}</p>
                  </div>

                </div>
              ) : (
                /* RENDER B: the beautiful double stamp coupon version reflecting original physical flyer design */
                <div className="border-4 border-emerald-900 p-4 sm:p-6 flex flex-col items-center bg-[#faf9f5] text-black select-text rounded-lg">
                  
                  {/* Header title */}
                  <div className="flex flex-col items-center justify-center text-center border-b-2 border-emerald-900 pb-3 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚽</span>
                      <h3 className="font-display font-black text-3xl italic tracking-tight uppercase leading-none text-emerald-900">
                        {appName.split(' ')[0]} <span className="opacity-80 text-zinc-800">{appName.split(' ').slice(1).join(' ') || 'APOSTAS'}</span>
                      </h3>
                    </div>
                    <p className="text-[8px] tracking-[0.35em] uppercase font-black leading-none text-emerald-800/80 mt-1.5">LOTECA ESPORTIVA DINÂMICA BRASIL</p>
                  </div>

                  <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 mt-5">
                    
                    {/* Left coupon seal (ticket verification, barcode, and whatsapp warning) */}
                    <div className="md:col-span-5 flex flex-col items-center justify-between text-center border-b md:border-b-0 md:border-r border-zinc-200 pb-5 md:pb-0 md:pr-5">
                      <div className="w-full space-y-3.5">
                        <div className="bg-emerald-900 text-[#befc17] text-[10px] font-black uppercase py-1.5 px-3 rounded-lg tracking-widest inline-block select-none shadow">
                          CÓDIGO DE ATIVAÇÃO
                        </div>
                        
                        <div className="space-y-1 w-full">
                          <div className="text-3xl font-black tracking-widest bg-white py-3.5 px-2 rounded-xl border-2 border-zinc-300 w-full shadow-inner select-all text-emerald-950 font-mono text-center">
                            {generatedTicket.code}
                          </div>
                          <p className="text-[8px] font-mono tracking-widest text-zinc-400 uppercase font-black">Guarde para concorrer à Moto 0 KM</p>
                        </div>

                        <div className="bg-[#102410]/5 border border-green-700/10 p-3 rounded-xl text-left text-[10.5px] space-y-1 text-emerald-900">
                          <p className="font-black uppercase tracking-wider leading-none text-emerald-900 border-b border-emerald-900/10 pb-1">⚠️ REGISTRO ONLINE:</p>
                          <p className="font-semibold leading-relaxed text-zinc-650">Este cupom foi emitido no terminal. O apostador deve registrar as opções com o operador via link do WhatsApp ao clicar no botão verde.</p>
                        </div>
                      </div>

                      {/* QR verification */}
                      <div className="mt-4 flex flex-col items-center">
                        <DynamicQRCode text={`D'GRAU-APOSTAS-CODE:${generatedTicket.code}-BUYER:${generatedTicket.buyerName}`} />
                        <p className="text-[8px] font-mono tracking-wider font-extrabold text-zinc-400 uppercase mt-1">ASSINATURA DE CONTROLE LOTECA</p>
                      </div>
                    </div>

                    {/* Right coupon seal containing exact choices printed onto matrix */}
                    <div className="md:col-span-7 flex flex-col justify-between">
                      <div>
                        {/* Selections header */}
                        <div className="flex justify-between items-center bg-[#115e24] text-white text-[10px] px-3 py-1.5 font-black rounded-lg mb-2 uppercase tracking-wider shadow">
                          <span>PALPITES EMITIDOS - 12 JOGOS</span>
                          <span className="text-[#befc17] font-display text-xs">MOTO 🏍️</span>
                        </div>

                        {/* List markup */}
                        <div className="space-y-1 bg-white p-2.5 rounded-xl border border-zinc-200 select-none">
                          {gamesList.map((game, index) => {
                            const bet = generatedTicket.bets.find((b) => b.gameId === game.id);
                            return (
                              <div key={game.id} className="flex items-center text-[11px] font-black border-b border-zinc-150 pb-1 last:border-0 last:pb-0">
                                <span className="w-5 font-mono text-green-700">{(index + 1).toString().padStart(2, '0')}</span>
                                <span className="flex-1 truncate uppercase text-zinc-800 font-extrabold">{game.homeTeam} x {game.awayTeam}</span>
                                <span className="font-mono bg-zinc-950 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md ml-2 min-w-[28px] text-center shadow-sm">
                                  {bet ? getChoiceLabel(bet.choice) : '-'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cash calculations info sheet */}
                      <div className="mt-4 pt-3 border-t-2 border-dashed border-zinc-300 space-y-1 font-sans">
                        <div className="flex justify-between items-end text-[10px] font-extrabold">
                          <span className="text-zinc-500 uppercase">Apostador:</span>
                          <span className="font-black uppercase text-zinc-900">{generatedTicket.buyerName}</span>
                        </div>
                        <div className="flex justify-between items-end text-[10px] font-extrabold">
                          <span className="text-zinc-500 uppercase">Data Emissão:</span>
                          <span className="font-black italic font-mono text-zinc-900">{format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-zinc-200">
                          <div className="text-left">
                            <p className="text-[7.5px] font-black text-zinc-400 uppercase leading-none">CUSTO DO BILHETE</p>
                            <p className="text-lg font-display font-black text-zinc-900">R$ {ticketPrice.toFixed(2).replace('.', ',')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[7.5px] font-black text-emerald-800 uppercase leading-none">ACERTE AS 12 GANHE</p>
                            <p className="text-lg font-display font-black text-[#115e24]">R$ {grandPrize}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Mock beautiful barcode */}
                  <div className="mt-6 w-full flex flex-col items-center border-t border-zinc-200 pt-3 select-none">
                    <div className="h-8 w-full bg-[repeating-linear-gradient(90deg,#000,#000_1px,transparent_1px,transparent_5px,#000_5px,#000_6px,transparent_6px,transparent_10px)] opacity-85" />
                    <p className="text-[8px] font-mono tracking-[0.6em] font-extrabold text-center text-zinc-500 mt-1 select-all">
                      {generatedTicket.code} - {generatedTicket.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  {/* Stamp footnote */}
                  <div className="mt-3.5 bg-zinc-100 border border-zinc-205 text-center w-full py-1.5 rounded-lg select-none">
                    <p className="text-xs font-black italic uppercase leading-none text-emerald-950">QUE A SORTE ESTEJA COM VOCÊ!</p>
                    <p className="text-[8px] font-extrabold uppercase mt-1 tracking-widest text-[#115e24]">Concorre à Moto Honda okm pelo código do bilhete de 12 partidas</p>
                  </div>

                </div>
              )}

            </div>

            {/* SEND DIRECT LINK TO WHATSAPP OR NATIVE PRINT */}
            <div className="mt-5 flex flex-col gap-3 no-print">
              
              {/* PRIMARY VALIDATOR VIA DEEP-LINK SENDING SPECIFIED METRIC */}
              <button 
                onClick={() => handleWhatsAppShare(generatedTicket)}
                className="w-full bg-[#25d366] text-white font-display font-black text-lg py-4.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#20ba56] hover:scale-[1.005] active:scale-95 transition-all shadow-[0_10px_35px_rgba(37,211,102,0.35)] border-b-4 border-green-700 cursor-pointer uppercase tracking-wider italic"
              >
                <Phone size={22} className="fill-current text-white animate-bounce" />
                Validar Bilhete no WhatsApp do operador
              </button>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 bg-white text-black font-display font-black uppercase text-xs py-4 rounded-xl flex items-center justify-center gap-2 border-2 border-black hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                >
                  <Printer size={15} className="text-zinc-650" />
                  Imprimir Comprovante
                </button>
                <button 
                  onClick={handleResetAll}
                  className="flex-1 bg-zinc-900 border border-zinc-750 text-white font-display font-bold uppercase text-xs py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw size={15} className="text-emerald-400" />
                  Voltar / Nova Aposta
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* SEÇÃO HISTÓRICO DE BILHETES SALVOS EM MEMÓRIA */}
      <div className="w-full max-w-4xl mt-8 bg-black/45 backdrop-blur-md rounded-3xl p-5 border border-green-500/20 shadow-2xl no-print">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-green-500/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#befc17]/10 flex items-center justify-center border border-[#befc17]/30">
              <History className="text-[#befc17] w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                Histórico de Bilhetes Emitidos
              </h3>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest leading-none mt-0.5">
                Gravado na memória da sua máquina ({savedTickets.length})
              </p>
            </div>
          </div>
          {savedTickets.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Deseja realmente limpar de forma permanente todo o histórico de bilhetes?")) {
                  setSavedTickets([]);
                  localStorage.removeItem('dgrau_apostas_saved_tickets');
                  setGeneratedTicket(null);
                }
              }}
              className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-950 bg-red-950/20 py-1.5 px-3 rounded-xl transition duration-150 cursor-pointer hover:bg-red-950/45"
            >
              Excluir Tudo
            </button>
          )}
        </div>

        {savedTickets.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 space-y-1.5">
            <p className="text-xs font-black uppercase tracking-wider">Histórico Vazio</p>
            <p className="text-[10px] text-zinc-450">Ao emitir uma cartela, ela será salva e aparecerá automaticamente neste histórico.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
            {savedTickets.map((ticket) => {
              const formattedDate = format(new Date(ticket.date), 'dd/MM/yyyy HH:mm');
              return (
                <div 
                  key={ticket.id}
                  className={cn(
                    "bg-[#0a140a]/80 border rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all hover:bg-[#0c1a0c] hover:border-green-500/30",
                    generatedTicket?.id === ticket.id ? "border-[#befc17] bg-[#0c1f0c]/60" : "border-green-950/40"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-left space-y-1">
                      <p className="text-[10px] font-black text-[#befc17] tracking-wider uppercase font-mono bg-[#befc17]/10 py-1 px-2.5 rounded-lg border border-[#befc17]/20 inline-block">
                        CÓDIGO: {ticket.code}
                      </p>
                      <h4 className="font-bold text-xs uppercase tracking-tight text-white line-clamp-1 mt-1.5">
                        {ticket.buyerName}
                      </h4>
                      <p className="text-[9px] text-zinc-450 font-mono tracking-tight font-medium">
                        Emissão: {formattedDate}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[8px] font-black uppercase text-[#befc17] leading-none">Custo</p>
                      <p className="text-[13px] font-extrabold text-white mt-0.5 font-mono">R$ {ticket.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-green-950/30 pt-3">
                    <button
                      onClick={() => {
                        setGeneratedTicket(ticket);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 bg-zinc-850 text-zinc-100 hover:bg-zinc-800 active:scale-[0.98] py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all border border-zinc-700/30"
                    >
                      <Eye size={12} className="text-[#befc17]" />
                      <span>Visualizar</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja excluir o bilhete de ${ticket.buyerName} com código ${ticket.code}?`)) {
                          handleDeleteTicket(ticket.id);
                        }
                      }}
                      className="bg-zinc-900 border border-red-950/50 text-red-400 hover:bg-rose-950/20 active:scale-[0.98] p-2 rounded-xl text-xs hover:text-red-300 cursor-pointer transition-all"
                      title="Excluir bilhete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="mt-12 text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center py-4 border-t border-green-950/20 w-full max-w-4xl no-print">
        <p>© 2026 {appName}. TODOS OS COMPROVANTES SÃO REGISTRADOS DIGITALMENTE VIA CÓDIGO ALFANUMÉRICO.</p>
        <p className="mt-1 text-[#befc17]/60">CONEXÃO SEGURA E IMPRESSÃO DE ALTA FIDELIDADE PARA IMPRESSORAS TÉRMICAS.</p>
      </footer>

    </div>
  );
}
