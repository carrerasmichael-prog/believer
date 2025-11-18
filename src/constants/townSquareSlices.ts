// src/constants/townSquareSlices.ts
export interface TownSquareSlice {
  id: string
  top: number
  left: number
  width: number
  height: number
  isRoom?: boolean
  isSound?: boolean
  src: string
}

export const townSquareSlices: TownSquareSlice[] = [
  {
    id: "muhammad",
    top: 165,
    left: 257,
    width: 67,
    height: 59,
    isSound: true,
    src: "/sounds/muhammad.mp3",
  },
  {
    id: "church-bell",
    top: 405,
    left: 1574,
    width: 66,
    height: 63,
    isSound: true,
    src: "/sounds/church-bell.mp3",
  },
  {
    id: "brahma",
    top: 426,
    left: 1285,
    width: 65,
    height: 64,
    isSound: true,
    src: "/sounds/brahma.mp3",
  },
  {
    id: "buddha",
    top: 467,
    left: 756,
    width: 53,
    height: 55,
    isSound: true,
    src: "/sounds/buddha.mp3",
  },
  {
    id: "star-of-david",
    top: 529,
    left: 1029,
    width: 102,
    height: 95,
    isSound: true,
    src: "/sounds/star-of-david.mp3",
  },
  {
    id: "mosque",
    top: 697,
    left: 425,
    width: 118,
    height: 134,
    isRoom: true,
    src: "/room/mosque",
  },
  {
    id: "temple",
    top: 708,
    left: 737,
    width: 151,
    height: 128,
    isRoom: true,
    src: "/room/temple",
  },
  {
    id: "synagogue",
    top: 720,
    left: 999,
    width: 159,
    height: 147,
    isRoom: true,
    src: "/room/synagogue",
  },
  {
    id: "church",
    top: 727,
    left: 1590,
    width: 242,
    height: 136,
    isRoom: true,
    src: "/room/church",
  },
  {
    id: "mandir",
    top: 746,
    left: 1353,
    width: 173,
    height: 113,
    isRoom: true,
    src: "/room/mandir",
  },
  {
    id: "atheist-flag",
    top: 777,
    left: 170,
    width: 40,
    height: 42,
    isSound: true,
    src: "/sounds/atheist-flag.mp3",
  },
  {
    id: "news",
    top: 827,
    left: 561,
    width: 164,
    height: 241,
    isRoom: true,
    src: "/room/news",
  },
  {
    id: "atheism",
    top: 826,
    left: 103,
    width: 90,
    height: 83,
    isRoom: true,
    src: "/room/atheism",
  },
  {
    id: "square",
    top: 884,
    left: 1139,
    width: 192,
    height: 185,
    isRoom: true,
    src: "/room/square?map=1",
  },
  {
    id: "market",
    top: 888,
    left: 1666,
    width: 250,
    height: 153,
    isRoom: true,
    src: "/room/market",
  },
]
