export interface RoomConfig {
  id: string;
  name: string;
  description: string;
  tags: string[];
  relayurl: string;
}

interface Rooms {
  [key: string]: RoomConfig;
  lobby: RoomConfig;
  atheism: RoomConfig;
  church: RoomConfig;
  market: RoomConfig;
  mathris: RoomConfig;
  mosque: RoomConfig;
  news: RoomConfig;
  synagogue: RoomConfig;
  temple: RoomConfig;
}

export const rooms: Rooms = {
  lobby: { id: 'lobby', name: 'Lobby', description: 'Main hub', tags: [], relayurl: 'wss://relay.damus.io' },
  atheism: { id: 'atheism', name: 'Atheism', description: 'Atheist discussions', tags: ['atheism'], relayurl: 'wss://relay.damus.io' },
  church: {
    id: 'church',
    name: 'Church',
    description: 'Christians room',
    tags: [
      'christianity',
      'catholicism',
      'catholic',
      'anglican',
      'lutheran',
      'methodist',
      'baptist',
      'presbyterian',
      'mormon',
      'pentecostal',
      'adventist',
      'advent',
      'orthodox',
      'christian',
      'church',
      'bible',
    ],
    relayurl: 'wss://public-relay.nostr.info',
  },
  market: { id: 'market', name: 'Market', description: 'Market discussions', tags: ['market'], relayurl: 'wss://relay.damus.io' },
  mathris: { id: 'mathris', name: 'Mathris', description: 'Mathris discussions', tags: ['mathris'], relayurl: 'wss://relay.damus.io' },
  mosque: { id: 'mosque', name: 'Mosque', description: 'Mosque discussions', tags: ['islam'], relayurl: 'wss://relay.damus.io' },
  news: { id: 'news', name: 'News', description: 'News discussions', tags: ['news'], relayurl: 'wss://relay.damus.io' },
  synagogue: { id: 'synagogue', name: 'Synagogue', description: 'Synagogue discussions', tags: ['judaism'], relayurl: 'wss://relay.damus.io' },
  temple: { id: 'temple', name: 'Temple', description: 'Temple discussions', tags: ['temple'], relayurl: 'wss://relay.damus.io' },
};
