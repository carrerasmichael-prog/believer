// src/navigation/Router.tsx
import { Suspense, useEffect } from 'react';
import { useNavigation } from './hooks';
import { routes } from './routes';
import { matchPath } from './utils';
import { LoadingFallback } from '@/shared/components/LoadingFallback';
import { RouteProvider } from './RouteContext';
import { RouteBaseContext } from './contexts';
import ErrorBoundary from '@/shared/components/ui/ErrorBoundary';
import TownSquare from '@/pages/landing/TownSquare';
import { useHasSeenThreshold, useDefaultRoom, useIsLoggedIn, useMarkThresholdSeen } from '@/stores/user';

// Define StackItem type explicitly
interface StackItem {
  url: string;
  index: number;
  state?: unknown;
}

// Named export
export const Router = () => {
  const { stack, currentIndex, replace } = useNavigation();

  // User state
  const hasSeenThreshold = useHasSeenThreshold();
  const defaultRoom = useDefaultRoom();
  const isLoggedIn = useIsLoggedIn();
  const markThresholdSeen = useMarkThresholdSeen();

  // Ensure stack is initialized
  const effectiveStack: StackItem[] = stack.length > 0 ? stack : [{ url: '/', index: 0 }];

  // Smart routing after login / first visit
  useEffect(() => {
    const currentUrl = effectiveStack[currentIndex]?.url || '/';

    // First visit → show Threshold
    if (!hasSeenThreshold && currentUrl === '/') {
      replace('/');
      markThresholdSeen(); // Mark seen immediately
      return;
    }

    // Returning user + logged in + at root → redirect
    if (hasSeenThreshold && isLoggedIn && currentUrl === '/') {
      const isDesktop = window.innerWidth >= 1200;
      const targetUrl = isDesktop ? '/townsquare' : `/room/${defaultRoom}`;
      replace(targetUrl);
    }
  }, [hasSeenThreshold, isLoggedIn, defaultRoom, currentIndex, effectiveStack, replace, markThresholdSeen]);

  return (
    <>
      {effectiveStack.map((item, index) => {
        let matchedRoute = null;
        let params: Record<string, string> = {};
        let basePath = '';

        // Force Threshold on root if not seen
        if (item.url === '/' && !hasSeenThreshold) {
          matchedRoute = { component: TownSquare };
        } else {
          for (const route of routes) {
            const match = matchPath(item.url, route.path);
            if (match) {
              matchedRoute = route;
              params = match.params;
              if (route.path.endsWith('/*')) {
                basePath = route.path.slice(0, -2);
              }
              break;
            }
          }
        }

        const RouteComponent = matchedRoute?.component || TownSquare;

        const routeKey = 'state' in item && item.state ? `stack-${item.index}` : `url-${item.url}`;

        return (
          <div
            key={routeKey}
            style={{
              display: index === currentIndex ? 'flex' : 'none',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
            }}
          >
            <RouteProvider params={params} url={item.url}>
              <RouteBaseContext.Provider value={basePath}>
                <ErrorBoundary>
                  <Suspense fallback={<LoadingFallback />}>
                    <RouteComponent {...params} />
                  </Suspense>
                </ErrorBoundary>
              </RouteBaseContext.Provider>
            </RouteProvider>
          </div>
        );
      })}
    </>
  );
};
