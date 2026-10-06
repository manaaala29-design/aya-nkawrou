import { I18nProvider } from "@/i18n";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { createTestQueryClient } from "./render";

export type RouteSpec = {
  path: string;
  // A function component, not `ComponentType`: TanStack Router's `RouteComponent`
  // rejects class components, and every page under test is a function.
  component: () => ReactNode;
  validateSearch?: (search: Record<string, unknown>) => Record<string, unknown>;
};

/**
 * Renders a page inside a real TanStack Router with the given routes, so
 * `useParams`, `useSearch`, `Link`, and `useNavigate` behave as in the app.
 * `initialPath` selects the active route via an in-memory history.
 */
export function renderWithRouter(
  routes: RouteSpec[],
  initialPath: string,
  options: { queryClient?: QueryClient; layout?: ReactNode } = {},
): RenderResult & { queryClient: QueryClient } {
  const queryClient = options.queryClient ?? createTestQueryClient();

  const rootRoute = createRootRoute({
    component: () => (
      <LayoutOrPassthrough layout={options.layout}>
        <Outlet />
      </LayoutOrPassthrough>
    ),
  });

  const childRoutes = routes.map((spec) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: spec.path,
      validateSearch: spec.validateSearch,
      component: spec.component,
    }),
  );

  const router = createRouter({
    routeTree: rootRoute.addChildren(childRoutes),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    defaultPendingMinMs: 0,
  });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </QueryClientProvider>,
  );

  return { ...result, queryClient };
}

function LayoutOrPassthrough({
  layout,
  children,
}: {
  layout?: ReactNode;
  children: ReactNode;
}) {
  if (!layout) return <>{children}</>;
  return <>{layout}</>;
}
