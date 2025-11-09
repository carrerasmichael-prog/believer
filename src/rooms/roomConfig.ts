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
    tags: ['lobby', 'religion', 'spirituality'],
    sound: 'lobby/door.mp3',
    icon: 'lobby/icon.png',
  },
  church: {
    id: 'church',
    name: 'Church',
    subtitle: 'Christian fellowship',
    tags: ['church', 'christianity'],
    sound: 'church/bell.mp3',
    icon: 'church/icon.png',
  },
  mosque: {
    id: 'mosque',
    name: 'Mosque',
    subtitle: 'Islamic community',
    tags: ['mosque', 'islam'],
    sound: 'mosque/call.mp3',
    icon: 'mosque/icon.png',
  },
  synagogue: {
    id: 'synagogue',
    name: 'Synagogue',
    subtitle: 'Jewish gathering',
    tags: ['synagogue', 'judaism'],
    sound: 'synagogue/shofar.mp3',
    icon: 'synagogue/icon.png',
  },
  temple: {
    id: 'temple',
    name: 'Temple',
    subtitle: 'Hindu devotion',
    tags: ['temple', 'hinduism'],
    sound: 'temple/bell.mp3',
    icon: 'temple/icon.png',
  },
  news: {
    id: 'news',
    name: 'News',
    subtitle: 'World events through faith',
    tags: ['news'],
    externalUrl: 'https://www.oann.com/',
  },
  market: {
    id: 'market',
    name: 'Market',
    subtitle: 'Buy, sell, trade in faith',
    tags: ['market', 'commerce'],
    sound: 'market/coin.mp3',
    icon: 'market/icon.png',
  },
  mathris: {
    id: 'mathris',
    name: 'Mathris',
    subtitle: 'Mathematical theology',
    tags: ['mathris', 'logic', 'proof'],
    sound: 'mathris/equation.mp3',
    icon: 'mathris/icon.png',
  },
  atheism: {
    id: 'atheism',
    name: 'Atheism',
    subtitle: 'Reason without faith',
    tags: ['atheism', 'skepticism'],
    sound: 'atheism/silence.mp3',
    icon: 'atheism/icon.png',
  },
};