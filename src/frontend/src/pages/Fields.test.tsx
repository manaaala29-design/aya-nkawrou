import { FieldsPage } from "@/pages/Fields";
import { makeSevenFields } from "@/test/fixtures";
import { applyCoreState, createHarness } from "@/test/render";
import { renderWithRouter } from "@/test/router";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const fieldsRoute = {
  path: "/fields",
  component: FieldsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search.search === "string" ? search.search : undefined,
    maxPrice: typeof search.maxPrice === "number" ? search.maxPrice : undefined,
    maxDistanceKm:
      typeof search.maxDistanceKm === "number"
        ? search.maxDistanceKm
        : undefined,
    minRating:
      typeof search.minRating === "number" ? search.minRating : undefined,
    timeSlot: typeof search.timeSlot === "string" ? search.timeSlot : undefined,
  }),
};

describe("Fields page", () => {
  beforeEach(() => {
    harness.actor.listFields.mockResolvedValue(makeSevenFields());
  });

  it("lists all seven Mahdia fields with price, status and rating", async () => {
    renderWithRouter([fieldsRoute], "/fields");

    await waitFor(() =>
      expect(screen.getByTestId("fields.card.1")).toBeInTheDocument(),
    );

    for (let index = 1; index <= 7; index += 1) {
      expect(screen.getByTestId(`fields.card.${index}`)).toBeInTheDocument();
    }

    const first = screen.getByTestId("fields.card.1");
    expect(first).toHaveTextContent("ISET Mahdia");
    expect(first).toHaveTextContent("5,6 DT");
    expect(first).toHaveTextContent("Disponible");
    // Rating is shown on the card.
    expect(first).toHaveTextContent("4.3");
    expect(screen.getByTestId("fields.results_count")).toHaveTextContent("7");
  });

  it("filters fields by name via the search box", async () => {
    const user = userEvent.setup();
    renderWithRouter([fieldsRoute], "/fields");

    await waitFor(() =>
      expect(screen.getByTestId("fields.card.1")).toBeInTheDocument(),
    );

    await user.type(screen.getByTestId("fields.search_input"), "Hiboun");

    await waitFor(() =>
      expect(screen.getByTestId("fields.results_count")).toHaveTextContent("1"),
    );
    expect(screen.getByTestId("fields.card.1")).toHaveTextContent(
      "Stade Hiboun",
    );
    expect(screen.queryByTestId("fields.card.2")).not.toBeInTheDocument();
  });

  it("filters fields by minimum rating from the URL search params", async () => {
    renderWithRouter([fieldsRoute], "/fields?minRating=4.5");

    await waitFor(() =>
      expect(screen.getByTestId("fields.card.1")).toBeInTheDocument(),
    );

    // Stade Hiboun (4.5), Stade Mahdia (4.6) and Stade Olympique (4.8) qualify.
    expect(screen.getByTestId("fields.results_count")).toHaveTextContent("3");
    const list = screen.getByTestId("fields.list");
    expect(within(list).getByText("Stade Hiboun")).toBeInTheDocument();
    expect(
      within(list).getByText("Stade Olympique de Mahdia"),
    ).toBeInTheDocument();
    expect(within(list).queryByText("ISET Mahdia")).not.toBeInTheDocument();
  });

  it("filters fields by maximum price from the URL search params", async () => {
    renderWithRouter([fieldsRoute], "/fields?maxPrice=5");

    await waitFor(() =>
      expect(screen.getByTestId("fields.empty_state")).toBeInTheDocument(),
    );
    // Every seeded field costs 5.6 DT, above the 5 DT ceiling.
    expect(screen.getByTestId("fields.results_count")).toHaveTextContent("0");
  });

  it("filters fields by time slot from the URL search params", async () => {
    renderWithRouter([fieldsRoute], "/fields?timeSlot=14%3A00");

    await waitFor(() =>
      expect(screen.getByTestId("fields.card.1")).toBeInTheDocument(),
    );
    // Only Stade Olympique offers the 14:00 slot.
    expect(screen.getByTestId("fields.results_count")).toHaveTextContent("1");
    expect(screen.getByTestId("fields.card.1")).toHaveTextContent(
      "Stade Olympique de Mahdia",
    );
  });
});
