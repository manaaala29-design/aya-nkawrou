import type { backendInterface } from "@/backend";
import { Principal } from "@icp-sdk/core/principal";
import { vi } from "vitest";

/**
 * A typed, local stand-in for the generated backend actor. Every method the
 * app calls is present so component code can run without a canister; tests
 * override only the methods they exercise.
 */
export type MockActor = {
  [K in keyof backendInterface]: ReturnType<typeof vi.fn>;
};

export const ANON = Principal.anonymous();

export function principal(text: string): Principal {
  return Principal.fromText(text);
}

const METHOD_NAMES: Array<keyof backendInterface> = [
  "addTeamPlayer",
  "assignCallerUserRole",
  "cancelBooking",
  "confirmBookingPayment",
  "createBooking",
  "createMatch",
  "createTeam",
  "execute",
  "getAccount",
  "getAdminOverview",
  "getApiDoc",
  "getBooking",
  "getCallerAccount",
  "getCallerUserRole",
  "getField",
  "getMatch",
  "getMatchShareCard",
  "getPlayerProfile",
  "getTeam",
  "inviteMatchPlayers",
  "isCallerAdmin",
  "listAccounts",
  "listAllBookings",
  "listFields",
  "listMatches",
  "listMyBookings",
  "listTeams",
  "login",
  "register",
  "removeTeamPlayer",
  "schema",
  "searchPlayers",
  "setAccountBanned",
  "setFieldAvailability",
  "setMyAvailability",
  "setTeamCaptain",
  "updateProfile",
];

/**
 * Builds a mock actor whose methods all resolve to `undefined` by default.
 * Tests assign concrete return values per method.
 */
export function createMockActor(
  overrides: Partial<Record<keyof backendInterface, unknown>> = {},
): MockActor {
  const actor = {} as MockActor;
  for (const name of METHOD_NAMES) {
    const value = overrides[name];
    actor[name] = vi.fn(async () => value) as MockActor[typeof name];
  }
  return actor;
}
