export interface Game {
  id: number;
  homeTeam: string;
  awayTeam: string;
}

export type BetChoice = 'CASA' | 'EMPATE' | 'FORA';

export interface Bet {
  gameId: number;
  choice: BetChoice;
}

export interface Ticket {
  id: string;
  buyerName: string;
  buyerPhone: string;
  bets: Bet[];
  date: string;
  price: number;
  code: string;
}
