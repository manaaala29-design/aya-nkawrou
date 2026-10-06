import { I18nProvider } from "@/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { type MockActor, createMockActor } from "./mock-actor";

export type AuthState = {
  isAuthenticated: boolean;
  identity: { getPrincipal: () => { toText: () => string } } | undefined;
  login: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
};

export type TestHarness = {
  actor: MockActor;
  auth: AuthState;
};

/**
 * Mutable state read by the hoisted `vi.mock` factory. Each test file must
 * declare the mock at its top level (Vitest only hoists `vi.mock` calls that
 * live in the test file itself):
 *
 * ```ts
 * const core = vi.hoisted(() => createCoreState());
 * vi.mock("@caffeineai/core-infrastructure", () => coreModuleMock(core));
 * const harness = createHarness();
 * applyCoreState(core, harness);
 * ```
 */
export type CoreState = {
  actor: MockActor | null;
  auth: AuthState;
};

export function createCoreState(): CoreState {
  return {
    actor: null,
    auth: {
      isAuthenticated: false,
      identity: undefined,
      login: vi.fn(),
      clear: vi.fn(),
    },
  };
}

/** Factory body for the hoisted `vi.mock("@caffeineai/core-infrastructure")`. */
export function coreModuleMock(core: CoreState) {
  return {
    useActor: () => ({ actor: core.actor, isFetching: false }),
    useInternetIdentity: () => ({
      identity: core.auth.identity,
      isAuthenticated: core.auth.isAuthenticated,
      isInitializing: false,
      login: core.auth.login,
      clear: core.auth.clear,
      loginStatus: "idle",
      isLoginIdle: true,
      isLoggingIn: false,
      isLoginSuccess: false,
      isLoginError: false,
      isSessionExpired: false,
    }),
    InternetIdentityProvider: ({ children }: { children: ReactNode }) =>
      children,
  };
}

export function createHarness(
  actorOverrides: Parameters<typeof createMockActor>[0] = {},
  authOverrides: Partial<AuthState> = {},
): TestHarness {
  const actor = createMockActor(actorOverrides);
  const auth: AuthState = {
    isAuthenticated: false,
    identity: undefined,
    login: vi.fn(),
    clear: vi.fn(),
    ...authOverrides,
  };
  return { actor, auth };
}

/** Points the hoisted core mock at a harness's actor and auth state. */
export function applyCoreState(core: CoreState, harness: TestHarness) {
  core.actor = harness.actor;
  core.auth = harness.auth;
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactNode,
  options: RenderOptions & { queryClient?: QueryClient } = {},
) {
  const { queryClient = createTestQueryClient(), ...rest } = options;
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <I18nProvider>{children}</I18nProvider>
      </QueryClientProvider>
    );
  }
  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...rest }),
  };
}
