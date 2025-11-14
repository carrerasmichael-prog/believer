// src/rooms/roomConfig.ts
export interface RoomConfig {
  id: string;
  name: string;
  subtitle: string;
  tags: string[];
  relayUrl?: string;
  sound?: string;
  icon?: string;
  externalUrl?: string;  // ← REQUIRED for news
}

export const ROOM_CONFIGS: Record<string, RoomConfig> = {
  
  lobby: {
    id: 'lobby',
    name: 'Lobby',
    subtitle: 'Public square',
    tags: ['lobby'],
    sound: 'sounds/door-sound.mp3',
    icon: 'lobby.png',
  },
  atheism: {
    id: 'atheism',
    name: 'Atheism',
    subtitle: 'Reason',
    tags: ['atheism'],
    sound: 'sounds/door-sound.mp3',
    icon: 'atheism.png',
  },
  church: {
    id: 'church',
    name: 'Church',
    subtitle: 'Christian communtiy',
    tags: ['church'],
    sound: 'sounds/church-bell.mp3',
    icon: 'church.png',
  },
  mosque: {
    id: 'mosque',
    name: 'Mosque',
    subtitle: 'Islamic community',
    tags: ['mosque'],
    sound: 'sounds/muhammad.mp3',
    icon: 'mosque.png',
  },
  synagogue: {
    id: 'synagogue',
    name: 'Synagogue',
    subtitle: 'Jewish community',
    tags: ['synagogue'],
    sound: 'sounds/star-of-david.mp3',
    icon: 'synagogue.png',
  },
  temple: {
    id: 'temple',
    name: 'Temple',
    subtitle: 'Devotion',
    tags: ['temple'],
    sound: 'sounds/buddha.mp3',
    icon: 'temple.png',
  },
  mandir: {
    id: 'mandir',
    name: 'Mandir',
    subtitle: 'Worship',
    tags: ['mandir'],
    sound: 'sounds/brahma.mp3',
    icon: 'mandir.png',
  },
  market: {
    id: 'market',
    name: 'Market',
    subtitle: 'Buy / Sell / Trade',
    tags: ['market'],
    sound: 'sounds/market.mp3',
    icon: 'market.png',
  },
  
  news: {
  id: 'news',
  name: 'News',
  subtitle: 'World events',
  tags: ['news'],
  sound: 'sounds/news.mp3',
  icon: 'news.png',
  externalUrl: 'https://www.oann.com/',
},
};