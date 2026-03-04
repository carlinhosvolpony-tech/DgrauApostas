
export enum BetOption {
  HOME = 'CASA',
  DRAW = 'EMPATE',
  AWAY = 'FORA',
  NONE = 'NONE'
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
  league: string;
}

export interface UserBet {
  matchId: string;
  choice: BetOption;
}

export interface PredictionInsight {
  matchId: string;
  recommendation: BetOption;
  reasoning: string;
}
