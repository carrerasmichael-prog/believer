// src/constants/townSquareSlices.ts
export interface TownSquareSlice {
  id: string;
  src: string;
  top: number;
  left: number;
  width: number;
  height: number;
  isRoom: boolean;
  isSound: boolean;
}

export const townSquareSlices: TownSquareSlice[] = [
  { id: 'muhammad', src: '/img/muhammad-slice.png', top: 171, left: 258, width: 66, height: 45, isRoom: false, isSound: true },
  { id: 'church-bell', src: '/sound/church-bell.mp3', top: 389, left: 1554, width: 33, height: 35, isRoom: false, isSound: true },
  { id: 'brahma', src: '/img/brahma-slice.png', top: 405, left: 1228, width: 40, height: 44, isRoom: false, isSound: true },
  { id: 'buddha', src: '/img/buddha-slice.png', top: 449, left: 1010, width: 29, height: 31, isRoom: false, isSound: true },
  { id: 'star-of-david', src: '/img/star-of-david-slice.png', top: 487, left: 774, width: 89, height: 79, isRoom: false, isSound: true },
  { id: 'church', src: '/img/church-slice.png', top: 616, left: 1394, width: 62, height: 102, isRoom: true, isSound: false },
  { id: 'mosque', src: '/img/mosque-slice.png', top: 624, left: 258, width: 66, height: 95, isRoom: true, isSound: false },
  { id: 'temple', src: '/img/temple-slice.png', top: 628, left: 987, width: 67, height: 88, isRoom: true, isSound: false },
  { id: 'synagogue', src: '/img/synagogue-slice.png', top: 632, left: 392, width: 75, height: 114, isRoom: true, isSound: false },
  { id: 'mathris', src: '/img/mathris-slice.png', top: 661, left: 1268, width: 52, height: 99, isRoom: true, isSound: false },
  { id: 'atheist-flag', src: '/img/atheist-flag-slice.png', top: 690, left: 1544, width: 27, height: 26, isRoom: false, isSound: true },
  { id: 'news', src: '/img/news-slice.png', top: 716, left: 1517, width: 161, height: 241, isRoom: true, isSound: false },
  { id: 'atheism', src: '/img/atheism-slice.png', top: 725, left: 1571, width: 32, height: 74, isRoom: true, isSound: false },
  { id: 'lobby', src: '/img/lobby-slice.png', top: 885, left: 1394, width: 191, height: 183, isRoom: true, isSound: false },
  { id: 'market', src: '/img/market-slice.png', top: 916, left: 1670, width: 250, height: 152, isRoom: true, isSound: false },
];
