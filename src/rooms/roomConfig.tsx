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
  default?: boolean;
}

export const ROOM_CONFIGS: Record<string, RoomConfig> = {
  
  square: {
    id: 'square',
    name: 'Town Square',
    subtitle: 'Public discourse',
    tags: ['neutral', 'debate', 'public'],
    sound: 'sounds/town-ambience.mp3',  // ← we'll create this
    icon: 'town-square.png',           // ← we'll rename later
    default: true,
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
    subtitle: 'Christian community',
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