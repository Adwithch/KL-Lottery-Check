import { LotteryDraw, Prize, CheckedTicket, LotteryType } from '../types';
import { MOCK_DRAWS } from '../constants';

const API_BASE = "https://indialotteryapi.com/wp-json/klr/v1";

// Internal cache to store fetched draws for the session
const drawsCache: Map<string, LotteryDraw> = new Map();

const parseAmount = (amt: string | undefined): number => {
  if (!amt) return 0;
  return parseInt(amt.replace(/[^0-9]/g, '') || '0');
};

const mapApiResponse = (item: any): LotteryDraw => {
  const prizes: Prize[] = [];
  const apiPrizes = item.prizes || {};
  const amounts = apiPrizes.amounts || {};

  // 1st Prize
  const firstTicket = item.first?.ticket || item.first_ticket;
  if (firstTicket) {
    prizes.push({
      category: '1st Prize',
      amount: parseAmount(amounts['1st']),
      numbers: [firstTicket]
    });
  }

  // Consolation Prizes
  if (apiPrizes.consolation && Array.isArray(apiPrizes.consolation)) {
    prizes.push({
      category: 'Consolation Prize',
      amount: parseAmount(amounts['consolation']),
      numbers: apiPrizes.consolation
    });
  }

  // 2nd through 9th Prizes
  const numericPrizes = ['2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
  numericPrizes.forEach(key => {
    if (apiPrizes[key] && Array.isArray(apiPrizes[key])) {
      prizes.push({
        category: `${key} Prize`,
        amount: parseAmount(amounts[key]),
        numbers: apiPrizes[key]
      });
    }
  });

  return {
    id: item.draw_code || `ID-${item.draw_date}`,
    name: item.draw_name as LotteryType,
    series: item.draw_code?.split('-')[0] || '',
    drawNumber: parseInt(item.draw_code?.split('-')[1] || '0'),
    date: item.draw_date,
    prizes: prizes,
    sources: item.sources
  };
};

export const fetchHistory = async (limit: number = 15, offset: number = 0): Promise<LotteryDraw[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  try {
    const response = await fetch(`${API_BASE}/history?limit=${limit}&offset=${offset}`, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    const items = data.items || [];
    const results = items.map(mapApiResponse);
    
    if (results.length === 0) throw new Error("No data returned");

    results.forEach((draw: LotteryDraw) => {
      drawsCache.set(draw.id, draw);
      drawsCache.set(draw.date, draw);
    });
    
    return results;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("API Fetch failed, using mock data:", error);
    // Return mock data so the app isn't blank
    return offset === 0 ? MOCK_DRAWS : [];
  }
};

export const fetchLatestResults = async (): Promise<LotteryDraw[]> => {
  return fetchHistory(15, 0);
};

export const fetchDrawByDate = async (date: string): Promise<LotteryDraw | null> => {
  if (drawsCache.has(date)) return drawsCache.get(date)!;

  try {
    const response = await fetch(`${API_BASE}/by-date?date=${date}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    const draw = mapApiResponse(data);
    
    drawsCache.set(draw.id, draw);
    drawsCache.set(draw.date, draw);
    
    return draw;
  } catch (error) {
    console.error(`Failed to fetch draw for ${date}, checking mocks:`, error);
    // Fallback to mock if matches date
    const mock = MOCK_DRAWS.find(d => d.date === date);
    return mock || null;
  }
};

export const getDrawById = (id: string): LotteryDraw | undefined => {
  return drawsCache.get(id) || Array.from(drawsCache.values()).find(d => d.id === id) || MOCK_DRAWS.find(d => d.id === id);
};

export const checkTicketResult = (draw: LotteryDraw, ticketNumber: string): { status: 'WIN' | 'MISS', prize?: Prize } => {
  const cleanInput = ticketNumber.replace(/\s/g, '').toUpperCase();
  for (const prize of draw.prizes) {
    for (const winningNum of prize.numbers) {
      const cleanWinning = winningNum.replace(/\s/g, '').toUpperCase();
      if (cleanInput === cleanWinning || (cleanWinning.length === 4 && cleanInput.endsWith(cleanWinning))) {
        return { status: 'WIN', prize };
      }
    }
  }
  return { status: 'MISS' };
};

export interface CloseMissResult {
  prizeCategory: string;
  prizeAmount: number;
  winningNumber: string;
  diffCount: number;
  missType: 'ONE' | 'TWO' | 'SHUFFLE';
}

export const getCloseMisses = (draw: LotteryDraw, ticketNumber: string): CloseMissResult[] => {
  const cleanInput = ticketNumber.replace(/\s/g, '').toUpperCase();
  const misses: CloseMissResult[] = [];

  draw.prizes.forEach(prize => {
    prize.numbers.forEach(winning => {
      const cleanWinning = winning.replace(/\s/g, '').toUpperCase();
      let diffCount = 0;
      let isShuffle = false;
      let relevantInput = cleanInput;

      // Handle different lengths
      if (cleanWinning.length === 4) {
        // Last 4 digit prize
        if (cleanInput.length >= 4) {
           relevantInput = cleanInput.slice(-4);
           // Compare last 4 chars
           for (let i = 0; i < 4; i++) {
             if (relevantInput[i] !== cleanWinning[i]) diffCount++;
           }
           // Check Shuffle (if not exact match)
           if (diffCount > 0) {
             const sortedInput = relevantInput.split('').sort().join('');
             const sortedWinning = cleanWinning.split('').sort().join('');
             if (sortedInput === sortedWinning) isShuffle = true;
           }
        } else {
          diffCount = 100; // invalid comparison
        }
      } else {
        // Full ticket comparison
        if (cleanInput.length === cleanWinning.length) {
          for (let i = 0; i < cleanInput.length; i++) {
            if (cleanInput[i] !== cleanWinning[i]) diffCount++;
          }
          const inputNum = cleanInput.replace(/\D/g, '');
          const winNum = cleanWinning.replace(/\D/g, '');
          if (inputNum.length === winNum.length && inputNum !== winNum) {
             const sortedInput = inputNum.split('').sort().join('');
             const sortedWin = winNum.split('').sort().join('');
             if (sortedInput === sortedWin) isShuffle = true;
          }
        } else {
           // Fallback: compare just the number part
           const inputNum = cleanInput.replace(/\D/g, '');
           const winNum = cleanWinning.replace(/\D/g, '');
           if (inputNum.length === winNum.length && inputNum.length > 3) {
             let numDiff = 0;
             for(let i=0; i<inputNum.length; i++) {
               if (inputNum[i] !== winNum[i]) numDiff++;
             }
             diffCount = numDiff; 
           } else {
             diffCount = 100;
           }
        }
      }

      if (isShuffle) {
        misses.push({
          prizeCategory: prize.category,
          prizeAmount: prize.amount,
          winningNumber: winning,
          diffCount,
          missType: 'SHUFFLE'
        });
      } else if (diffCount === 1) {
        misses.push({
          prizeCategory: prize.category,
          prizeAmount: prize.amount,
          winningNumber: winning,
          diffCount,
          missType: 'ONE'
        });
      } else if (diffCount === 2) {
        misses.push({
          prizeCategory: prize.category,
          prizeAmount: prize.amount,
          winningNumber: winning,
          diffCount,
          missType: 'TWO'
        });
      }
    });
  });

  const uniqueMisses = misses.filter((v,i,a) => a.findIndex(t => t.winningNumber === v.winningNumber) === i);
  return uniqueMisses.sort((a, b) => b.prizeAmount - a.prizeAmount);
};