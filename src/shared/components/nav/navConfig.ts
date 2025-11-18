// src/shared/components/nav/navConfig.ts
interface NavItemConfig {
  to?: string
  label: string
  icon: string
  activeIcon: string
  inactiveIcon: string
  requireLogin?: boolean
  onClick?: () => void
  includeInLargeScreen?: boolean
}

export const navItemsConfig = (): Record<string, NavItemConfig> => {
  return {
    home: {
      to: "/",
      label: "Home",
      icon: "ri-home-line",
      activeIcon: "ri-home-fill",
      inactiveIcon: "ri-home-line",
      includeInLargeScreen: true,
    },
    search: {
      to: "/search",
      label: "Search",
      icon: "ri-search-line",
      activeIcon: "ri-search-fill",
      inactiveIcon: "ri-search-line",
      includeInLargeScreen: true,
    },
    about: {
      to: "/about",
      label: "About",
      icon: "ri-information-line",
      activeIcon: "ri-information-fill",
      inactiveIcon: "ri-information-line",
      includeInLargeScreen: true,
    },
    destiny: {
      label: "Destiny",
      icon: "ri-map-pin-line",
      activeIcon: "ri-map-pin-fill",
      inactiveIcon: "ri-map-pin-line",
      includeInLargeScreen: false,
    },
    notifications: {
      to: "/notifications",
      label: "Notifications",
      icon: "ri-notification-line",
      activeIcon: "ri-notification-fill",
      inactiveIcon: "ri-notification-line",
      requireLogin: true,
      includeInLargeScreen: true,
    },
    chats: {
      to: "/messages",
      label: "Chats",
      icon: "ri-chat-1-line",
      activeIcon: "ri-chat-1-fill",
      inactiveIcon: "ri-chat-1-line",
      requireLogin: true,
      includeInLargeScreen: true,
    },
    subscription: {
      to: "/subscription",
      label: "Subscription",
      icon: "ri-star-line",
      activeIcon: "ri-star-fill",
      inactiveIcon: "ri-star-line",
      requireLogin: true,
      includeInLargeScreen: true,
    },
    wallet: {
      to: "/wallet",
      label: "Wallet",
      icon: "ri-wallet-line",
      activeIcon: "ri-wallet-fill",
      inactiveIcon: "ri-wallet-line",
      requireLogin: true,
      includeInLargeScreen: true,
    },
  }
}
