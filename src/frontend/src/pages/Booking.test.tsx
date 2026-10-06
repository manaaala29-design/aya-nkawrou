import { BookingPage } from "@/pages/Booking";
import { BookingConfirmationPage } from "@/pages/BookingConfirmation";
import { makeAccount, makeBooking, makeField } from "@/test/fixtures";
import { applyCoreState, createHarness } from "@/test/render";
import { renderWithRouter } from "@/test/router";
import { BookingStatus } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const core = vi.hoisted(() => ({
  actor: null as never,
  auth: {
    isAuthenticated: true,
    identity: { getPrincipal: () => ({ toText: () => "aaaaa-aa" }) },
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

const harness = createHarness(
  {},
  {
    isAuthenticated: true,
    identity: { getPrincipal: () => ({ toText: () => "aaaaa-aa" }) },
  },
);
applyCoreState(core, harness);

const routes = [
  { path: "/booking/$fieldId", component: BookingPage },
  {
    path: "/booking-confirmation/$bookingId",
    component: BookingConfirmationPage,
  },
];

describe("booking journey", () => {
  beforeEach(() => {
    harness.actor.getCallerAccount.mockResolvedValue(makeAccount());
    harness.actor.getField.mockResolvedValue(makeField());
    harness.actor.createBooking.mockResolvedValue(
      makeBooking({ status: BookingStatus.pending }),
    );
    harness.actor.confirmBookingPayment.mockResolvedValue({
      __kind__: "ok",
      ok: makeBooking({
        status: BookingStatus.paid,
        paymentReference: "SBX-TEST-4242",
      }),
    });
    harness.actor.getBooking.mockResolvedValue(
      makeBooking({
        status: BookingStatus.paid,
        paymentReference: "SBX-TEST-4242",
      }),
    );
  });

  it("completes details → summary → sandbox payment → confirmation with number and QR", async () => {
    const user = userEvent.setup();
    renderWithRouter(routes, "/booking/1");

    // Step 1: details.
    expect(await screen.findByTestId("booking.page")).toBeInTheDocument();
    // The field name appears in the header and in the field summary card.
    expect(screen.getAllByText("ISET Mahdia").length).toBeGreaterThan(0);

    await user.click(screen.getByTestId("booking.time_slot.1830"));
    await user.type(
      screen.getByTestId("booking.team_name_input"),
      "Les Aigles",
    );
    await user.click(screen.getByTestId("booking.continue_button"));

    // Step 2: summary.
    expect(
      await screen.findByTestId("booking.pay_now_button"),
    ).toBeInTheDocument();
    expect(screen.getByText("Les Aigles")).toBeInTheDocument();
    await user.click(screen.getByTestId("booking.pay_now_button"));

    // Step 3: sandbox payment form.
    expect(await screen.findByTestId("payment.form")).toBeInTheDocument();
    expect(screen.getByText("Paiement sécurisé")).toBeInTheDocument();

    await user.type(screen.getByTestId("payment.card_name_input"), "Ala Manaa");
    await user.type(
      screen.getByTestId("payment.card_number_input"),
      "4242424242424242",
    );
    await user.type(screen.getByTestId("payment.card_expiry_input"), "1230");
    await user.type(screen.getByTestId("payment.card_cvc_input"), "123");
    await user.click(screen.getByTestId("payment.submit_button"));

    // Confirmation: paid status, booking number and QR code.
    expect(
      await screen.findByTestId("confirmation.success_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Paiement réussi")).toBeInTheDocument();
    expect(screen.getByTestId("confirmation.booking_number")).toHaveTextContent(
      "#42",
    );
    expect(screen.getByTestId("confirmation.qr_card")).toBeInTheDocument();
    // The QR renders as an SVG with an accessible label.
    expect(screen.getByRole("img", { name: /#42/ })).toBeInTheDocument();
    expect(harness.actor.confirmBookingPayment).toHaveBeenCalledWith(
      42n,
      expect.stringMatching(/^SBX-/),
    );
  });

  it("blocks the payment form until card details are valid", async () => {
    const user = userEvent.setup();
    renderWithRouter(routes, "/booking/1");

    await screen.findByTestId("booking.page");
    await user.click(screen.getByTestId("booking.time_slot.1830"));
    await user.type(
      screen.getByTestId("booking.team_name_input"),
      "Les Aigles",
    );
    await user.click(screen.getByTestId("booking.continue_button"));
    await user.click(await screen.findByTestId("booking.pay_now_button"));

    await screen.findByTestId("payment.form");
    await user.type(screen.getByTestId("payment.card_name_input"), "Ala");
    await user.type(
      screen.getByTestId("payment.card_number_input"),
      "1234567890123456",
    );
    await user.type(screen.getByTestId("payment.card_expiry_input"), "1230");
    await user.type(screen.getByTestId("payment.card_cvc_input"), "123");
    await user.click(screen.getByTestId("payment.submit_button"));

    await waitFor(() =>
      expect(
        screen.getByTestId("payment.card_number_error"),
      ).toBeInTheDocument(),
    );
    expect(harness.actor.confirmBookingPayment).not.toHaveBeenCalled();
  });

  it("requires login before booking", async () => {
    harness.auth.isAuthenticated = false;
    renderWithRouter(routes, "/booking/1");

    expect(
      await screen.findByTestId("booking.login_required_state"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("booking.login_button")).toBeInTheDocument();
  });
});
