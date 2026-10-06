import { Footer } from "@/components/Footer";
import { HomePage } from "@/pages/Home";
import { makeSevenFields, makeTeam } from "@/test/fixtures";
import { applyCoreState, createHarness } from "@/test/render";
import { renderWithRouter } from "@/test/router";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const core = vi.hoisted(() => ({
  actor: null as never,
  auth: {
    isAuthenticated: false,
    identity: undefined,
    login: vi.fn(),
    clear: vi.fn(),
  },
}));
vi.mock("@caffeineai/core-infrastructure", () => ({
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
  InternetIdentityProvider: ({ children }: { children: unknown }) => children,
}));

const harness = createHarness();
applyCoreState(core, harness);

describe("Home page (default route)", () => {
  beforeEach(() => {
    harness.actor.listMatches.mockResolvedValue([]);
    harness.actor.listFields.mockResolvedValue(makeSevenFields());
    harness.actor.listTeams.mockResolvedValue([makeTeam()]);
    harness.actor.searchPlayers.mockResolvedValue([]);
  });

  it("renders a non-blank default route with the app name and hero", async () => {
    renderWithRouter([{ path: "/", component: HomePage }], "/");

    expect(await screen.findByTestId("home.page")).toBeInTheDocument();
    expect(screen.getByTestId("home.hero_section")).toBeInTheDocument();
    expect(screen.getByText("AYA NKAWROU?")).toBeInTheDocument();
    // Quick actions are the primary entry points into the booking journey.
    expect(screen.getByTestId("home.book_field_button")).toBeInTheDocument();
    expect(screen.getByTestId("home.book_match_button")).toBeInTheDocument();
  });

  it("shows available fields with price, status and rating", async () => {
    renderWithRouter([{ path: "/", component: HomePage }], "/");

    await waitFor(() =>
      expect(screen.getByTestId("field.card.1")).toBeInTheDocument(),
    );

    // Home previews up to six available fields.
    for (let index = 1; index <= 6; index += 1) {
      expect(screen.getByTestId(`field.card.${index}`)).toBeInTheDocument();
    }

    const firstCard = screen.getByTestId("field.card.1");
    expect(firstCard).toHaveTextContent("ISET Mahdia");
    expect(firstCard).toHaveTextContent("5,6 DT");
    expect(firstCard).toHaveTextContent("Disponible");
  });

  it("renders the footer subscription price and Ala Manaa credits", async () => {
    renderWithRouter([{ path: "/", component: () => <Footer /> }], "/");

    const footer = await screen.findByTestId("footer");
    expect(footer).toHaveTextContent("6 DT");
    expect(footer).toHaveTextContent("Developed by Ala Manaa — Student");
    expect(screen.getByTestId("footer.subscribe_button")).toBeInTheDocument();
  });
});
