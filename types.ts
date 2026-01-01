
export type LotteryType = 'Win-Win' | 'Karunya' | 'Karunya Plus' | 'Akshaya' | 'Nirmal' | 'Fifty-Fifty' | 'Sthree Sakthi';

export interface Prize {
  category: string;
  amount: number;
  numbers: string[];
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface LotteryDraw {
  id: string;
  name: LotteryType;
  series: string; // e.g. W
  drawNumber: number; // e.g. 755
  date: string;
  prizes: Prize[];
  sources?: GroundingSource[];
}

export interface CheckedTicket {
  id: string;
  ticketNumber: string;
  lotteryName: string;
  drawDate: string;
  status: 'WIN' | 'MISS' | 'PENDING';
  prizeCategory?: string;
  prizeAmount?: number;
  timestamp: number;
}
