
import { LotteryDraw, LotteryType } from './types';

export const LOTTERY_NAMES: LotteryType[] = [
  'Win-Win',
  'Akshaya',
  'Sthree Sakthi',
  'Fifty-Fifty',
  'Karunya Plus',
  'Nirmal',
  'Karunya'
];

export const MOCK_DRAWS: LotteryDraw[] = [
  {
    id: '1',
    name: 'Win-Win',
    series: 'W',
    drawNumber: 755,
    date: '2024-05-20',
    prizes: [
      { category: '1st Prize', amount: 7500000, numbers: ['WN 123456'] },
      { category: 'Consolation', amount: 8000, numbers: ['WA 123456', 'WB 123456', 'WC 123456'] },
      { category: '2nd Prize', amount: 500000, numbers: ['WB 987654'] },
      { category: '3rd Prize', amount: 100000, numbers: ['1122', '3344', '5566', '7788', '9900'] },
      { category: '4th Prize', amount: 5000, numbers: ['1234', '5678', '9012', '3456'] },
      { category: '5th Prize', amount: 2000, numbers: ['1111', '2222', '3333', '4444'] },
    ]
  },
  {
    id: '2',
    name: 'Sthree Sakthi',
    series: 'SS',
    drawNumber: 386,
    date: '2024-05-19',
    prizes: [
      { category: '1st Prize', amount: 7500000, numbers: ['SS 556677'] },
      { category: '2nd Prize', amount: 1000000, numbers: ['SS 889900'] },
      { category: '3rd Prize', amount: 5000, numbers: ['1212', '3434', '5656'] },
    ]
  },
  {
    id: '3',
    name: 'Fifty-Fifty',
    series: 'FF',
    drawNumber: 69,
    date: '2024-05-18',
    prizes: [
      { category: '1st Prize', amount: 10000000, numbers: ['FF 112233'] },
      { category: '2nd Prize', amount: 1000000, numbers: ['FF 445566'] },
      { category: '3rd Prize', amount: 5000, numbers: ['9988', '7766'] },
    ]
  }
];
