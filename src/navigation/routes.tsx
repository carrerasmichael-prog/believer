import { lazy } from "react";
import { RouteDefinition } from "./types";

// Base pages
import NostrLinkHandler from "@/pages/NostrLinkHandler";
import Notifications from "@/pages/notifications/Notifications";
import WalletPage from "@/pages/wallet/WalletPage";
import { AboutPage } from "@/pages/AboutPage";
import SearchPage from "@/pages/search";
import HomePage from "@/pages/home";
import NewNote from "@/pages/new";

// Believer.go imports
import DynamicRoom from "@/components/dynamicroom";

// Lazy load main pages
const ChatsPage = lazy(() => import("@/pages/chats"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const SubscriptionPage = lazy(() => import("@/pages/subscription"));
const RelayPage = lazy(() => import("@/pages/relay"));
const MapPage = lazy(() => import("@/pages/map"));
const MarketPage = lazy(() => import("@/pages/market"));
const UserSearchPage = lazy(() => import("@/pages/user-search"));

// ✅ TownSquare should be lazy-loaded and external to the client
const TownSquare = lazy(() => import("@/pages/landing/TownSquare"));

export const routes: RouteDefinition[] = [
  // 🏙️ Believer.go Routes
  { path: "/", component: TownSquare, alwaysKeep: true }, // landing page
  { path: "/room/:roomid", component: DynamicRoom },      // dynamic client view

  // 💬 Client routes
  { path: "/new", component: NewNote },
  { path: "/notifications", component: Notifications },
  { path: "/wallet", component: WalletPage },
  { path: "/chats/*", component: ChatsPage },
  { path: "/settings/*", component: SettingsPage },
  { path: "/subscribe", component: SubscriptionPage },
  { path: "/search", component: SearchPage },
  { path: "/search/:query", component: SearchPage },
  { path: "/m", component: MarketPage },
  { path: "/m/:category", component: MarketPage },
  { path: "/u", component: UserSearchPage },
  { path: "/u/:query", component: UserSearchPage },
  { path: "/relay", component: RelayPage },
  { path: "/relay/:url", component: RelayPage },
  { path: "/map", component: MapPage },
  { path: "/map/:query", component: MapPage },
  { path: "/about", component: AboutPage },
  { path: "/:link/*", component: NostrLinkHandler },
  { path: "/:link", component: NostrLinkHandler },
];


