// src/navigation/Router.tsx
import { Suspense } from 'react';
import { useNavigation } from './hooks';
import { routes } from './routes';
import { matchPath } from './utils';
import { LoadingFallback } from '@/shared/components/LoadingFallback';
import { RouteProvider } from './RouteContext';
import { RouteBaseContext } from './contexts';
import ErrorBoundary from '@/shared/components/ui/ErrorBoundary';
import TownSquare from '@/pages/landing/TownSquare';

// Define StackItem type explicitly
interface StackItem {
  url: string;
  index: number;
  state?: unknown;
}

// Named export instead of default
export const Router = () => {
  const { stack, currentIndex } = useNavigation();

  // Ensure stack is initialized with fallback route if empty
  const effectiveStack: StackItem[] = stack.length > 0 ? stack : [{ url: '/', index: 0 }];

  return (
    <>
      {effectiveStack.map((item, index) => {
        let matchedRoute = null;
        let params: Record<string, string> = {};
        let basePath = '';

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
