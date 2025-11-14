// src/shared/constants/menuItems.ts
import { ROOM_CONFIGS } from '@/rooms/roomConfig.tsx';

export const MENU_ITEMS = [
  // 1. Home
  {
    type: 'link' as const,
    label: 'Home',
    path: '/',
  },

  // 2. All rooms (in the exact order they appear in ROOM_CONFIGS)
  ...Object.entries(ROOM_CONFIGS).map(([id, config]) => ({
    type: 'room' as const,
    id,
    label: config.name,
    path: `/room/${id}`,
  })),

  // 3. Separator
  { type: 'separator' as const },

  // 4. About
  {
    type: 'link' as const,
    label: 'About',
    path: '/about',
  },

  // 5. Search (always last)
  {
    type: 'link' as const,
    label: 'Search',
    path: '/search',
  },
];