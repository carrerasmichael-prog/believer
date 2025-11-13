import '@/index.css';
import { NavigationProvider, Router } from '@/navigation';
import { useUserStore } from './stores/user';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { subscribeToDMNotifications, subscribeToNotifications } from './utils/notifications';
import { migratePublicChats } from './utils/migration'; // Removed unused migrateUserState
import pushNotifications from './utils/pushNotifications';
import { useSettingsStore } from '@/stores/settings';
import { ndk } from './utils/ndk';
import socialGraph from './utils/socialGraph';
import DebugManager from './utils/DebugManager';
import Layout from '@/shared/components/Layout';
import { usePrivateMessagesStore } from './stores/privateMessages';
import { getSessionManager } from './shared/services/PrivateChats';
import { getTag } from './utils/tagUtils';

let unsubscribeSessionEvents: (() => void) | null = null;

const attachSessionEventListener = () => {
  try {
    const sessionManager = getSessionManager();
    if (!sessionManager) {
      console.error('Session manager not available');
      return;
    }
    void sessionManager
      .init()
      .then(() => {
        unsubscribeSessionEvents?.();
        unsubscribeSessionEvents = sessionManager.onEvent((event, pubKey) => {
          const { publicKey } = useUserStore.getState();
          if (!publicKey) return;

          const pTag = getTag('p', event.tags);
          if (!pTag) return;

          const from = pubKey === publicKey ? pTag : pubKey;
          const to = pubKey === publicKey ? publicKey : pTag;

          if (!from || !to) return;

          void usePrivateMessagesStore.getState().upsert(from, to, event);
        });
      })
      .catch((error) => {
        console.error('Failed to initialize session manager (possibly corrupt data):', error);
      });
  } catch (error) {
    console.error('Failed to attach session event listener', error);
  }
};

// Initialize app
const initializeApp = () => {
  // Call ndk() to get NDK instance
  const ndkInstance = ndk();
  ndkInstance.connect().catch((e: unknown) => console.error('NDK connect error:', e));

  // Initialize debug system
  DebugManager;

  // Initialize chat modules if we have a public key
  const state = useUserStore.getState();
  if (state.publicKey) {
    console.log('Initializing chat modules with existing user data');
    subscribeToNotifications();
    subscribeToDMNotifications();
    migratePublicChats();
    socialGraph().recalculateFollowDistances();

    // Initialize mobile push notifications for Tauri
    if (window.__TAURI__) {
      pushNotifications.init().catch(console.error);
    }

    // Only initialize DM sessions if not in readonly mode
    if (state.privateKey || state.nip07Login) {
      attachSessionEventListener();
    }
  }

  document.title = 'Believer';

  // Initialize theme: localStorage > settings store > system preference
  const storedTheme = localStorage.getItem('theme');
  const { appearance } = useSettingsStore.getState();
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || appearance.theme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initialTheme);
  document.documentElement.classList.toggle('dark', initialTheme === 'dark');
};

// Initialize app
initializeApp();

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <BrowserRouter>
    <NavigationProvider>
      <Layout>
        <Router />
      </Layout>
    </NavigationProvider>
  </BrowserRouter>
);

// Store subscriptions
const unsubscribeUser = useUserStore.subscribe((state, prevState) => {
  // Only proceed if public key actually changed
  if (state.publicKey && state.publicKey !== prevState.publicKey) {
    console.log('Public key changed, initializing chat modules');
    subscribeToNotifications();
    subscribeToDMNotifications();
    migratePublicChats();

    // Only initialize DM sessions if not in readonly mode
    if (state.privateKey || state.nip07Login) {
      attachSessionEventListener();
    }
  }
});

// Subscribe to theme changes and persist to localStorage
const unsubscribeTheme = useSettingsStore.subscribe((state) => {
  if (typeof state.appearance.theme === 'string') {
    document.documentElement.setAttribute('data-theme', state.appearance.theme);
    document.documentElement.classList.toggle('dark', state.appearance.theme === 'dark');
    localStorage.setItem('theme', state.appearance.theme); // Persist for reloads
  }
});

// Prevent flash-of-wrong-theme by applying theme early
const applyInitialTheme = () => {
  const storedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
};
applyInitialTheme();

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    // Clean up subscriptions on hot reload
    unsubscribeUser();
    unsubscribeTheme();
    unsubscribeSessionEvents?.();
  });
}