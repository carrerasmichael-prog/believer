// src/rooms/roomConfig.ts
export interface RoomConfig {
  id: string;
  name: string;
  subtitle: string;
  tags: string[];
  relayUrl?: string;
  externalUrl?: string;
  sound?: string;
  icon?: string;
}

export const ROOM_CONFIGS: Record<string, RoomConfig> = {
  lobby: {
  id: 'lobby',
  name: 'Lobby',
  subtitle: 'Main hub for all believers',
  tags: ['lobby'],
  sound: '/sounds/lobby.mp3',
  icon: 'lobby.png',
},
church: {
  id: 'church',
  name: 'Church',
  subtitle: 'Christian fellowship',
  tags: ['church'],
  sound: '/sounds/church.mp3',
  icon: 'church.png',
},
mosque: {
  id: 'mosque',
  name: 'Mosque',
  subtitle: 'Islamic community',
  tags: ['mosque'],
  sound: '/sounds/mosque.mp3',
  icon: 'mosque.png',
},
synagogue: {
  id: 'synagogue',
  name: 'Synagogue',
  subtitle: 'Jewish gathering',
  tags: ['synagogue'],
  sound: '/sounds/synagogue.mp3',
  icon: 'synagogue.png',
},
temple: {
  id: 'temple',
  name: 'Temple',
  subtitle: 'Hindu & Buddhist devotion',
  tags: ['temple'],
  sound: '/sounds/temple.mp3',
  icon: 'temple.png',
},
mandir: {
  id: 'mandir',
  name: 'Mandir',
  subtitle: 'Hindu temple of worship',
  tags: ['mandir', 'hinduism'],
  sound: '/sounds/mandir.mp3',
  icon: 'mandir.png',
},
market: {
  id: 'market',
  name: 'Market',
  subtitle: 'Buy, sell, trade in faith',
  tags: ['market'],
  sound: '/sounds/market.mp3',
  icon: 'market.png',
},
atheism: {
  id: 'atheism',
  name: 'Atheism',
  subtitle: 'Reason without faith',
  tags: ['atheism'],
  sound: '/sounds/atheism.mp3',
  icon: 'atheism.png',
},
news: {
  id: 'news',
  name: 'News',
  subtitle: 'World events through faith',
  tags: ['news'],
  sound: '/sounds/news.mp3',
  externalUrl: 'https://www.oann.com/',
  icon: 'news.png',
},
};