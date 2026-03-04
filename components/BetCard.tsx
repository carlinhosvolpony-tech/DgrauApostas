
import React from 'react';
import { Match, BetOption } from '../types';

interface BetCardProps {
  match: Match;
  selectedOption: BetOption;
  onSelect: (option: BetOption) => void;
  insight?: { recommendation: BetOption; reasoning: string };
}

const BetCard: React.FC<BetCardProps> = ({ match, selectedOption, onSelect, insight }) => {
  return (
    <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg overflow-hidden mb-3 hover:border-emerald-500 transition-all">
      <div className="p-3 flex items-center justify-between gap-2 border-b border-emerald-800 bg-emerald-950/50">
        <span className="text-[10px] uppercase font-bold text-emerald-400">{match.league}</span>
        <span className="text-[10px] font-medium text-emerald-500">{match.time}</span>
      </div>
      
      <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center md:text-left font-bold text-lg w-full">
          <span className="block md:inline">{match.homeTeam}</span>
          <span className="mx-2 text-emerald-600 font-light">vs</span>
          <span className="block md:inline">{match.awayTeam}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
          {(['HOME', 'DRAW', 'AWAY'] as const).map((opt) => {
            const label = opt === 'HOME' ? '1' : opt === 'DRAW' ? 'X' : '2';
            const optionValue = BetOption[opt];
            const isSelected = selectedOption === optionValue;
            
            return (
              <button
                key={opt}
                onClick={() => onSelect(optionValue)}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-md transition-all min-w-[70px]
                  ${isSelected 
                    ? 'bg-lime-400 text-emerald-950 font-black scale-105 shadow-lg shadow-lime-400/20' 
                    : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700'}
                `}
              >
                <span className="text-[10px] font-bold mb-1 opacity-80">{optionValue}</span>
                <span className="text-xl font-oswald">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {insight && (
        <div className="px-4 py-2 bg-emerald-950/80 border-t border-emerald-800 flex items-start gap-2">
          <i className="fas fa-robot text-lime-400 mt-1"></i>
          <p className="text-[11px] text-emerald-200">
            <span className="font-bold text-lime-400">Dica IA:</span> {insight.reasoning}
          </p>
        </div>
      )}
    </div>
  );
};

export default BetCard;
