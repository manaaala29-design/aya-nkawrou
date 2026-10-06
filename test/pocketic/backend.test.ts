import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

// Deterministic callers: the same seed names the same principal in every run.
const alice = createIdentity("alice");

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
    }));
    return;
  }
  // `[baseline, current]`, the same install contract the hosted deploy uses for
  // a converted project. The upgrade replays the chain from the legacy schema.
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BASELINE_WASM,
  });
  await pic.upgradeCanister({
    canisterId: installed.canisterId,
    wasm: BACKEND_WASM,
    arg: new Uint8Array(),
  });
  ({ actor, canisterId } = installed);
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("seeds the seven Mahdia fields and answers an empty-state read", async () => {
  const fields = await actor.listFields({
    minRating: [],
    maxPrice: [],
    maxDistanceKm: [],
    timeSlot: [],
  });
  expect(fields).toHaveLength(7);
  expect(fields.map((field) => field.name)).toContain("ISET Mahdia");
  expect(fields[0]).toMatchObject({ priceDt: 5.6, available: true });

  // No bookings, teams or matches exist yet.
  await expect(actor.listMyBookings()).resolves.toEqual([]);
  await expect(actor.listTeams()).resolves.toEqual([]);
  await expect(actor.listMatches()).resolves.toEqual([]);
});

it("filters fields by price, distance, rating and time slot", async () => {
  const byRating = await actor.listFields({
    minRating: [4.5],
    maxPrice: [],
    maxDistanceKm: [],
    timeSlot: [],
  });
  expect(byRating.map((field) => field.name).sort()).toEqual(
    ["Stade Hiboun", "Stade Mahdia", "Stade Olympique de Mahdia"].sort(),
  );

  const byPrice = await actor.listFields({
    minRating: [],
    maxPrice: [5],
    maxDistanceKm: [],
    timeSlot: [],
  });
  expect(byPrice).toEqual([]);

  const bySlot = await actor.listFields({
    minRating: [],
    maxPrice: [],
    maxDistanceKm: [],
    timeSlot: ["14:00"],
  });
  expect(bySlot.map((field) => field.name)).toEqual([
    "Stade Olympique de Mahdia",
  ]);
});

it("round-trips a booking through create → pay → read", async () => {
  actor.setIdentity(alice);
  const created = await actor.createBooking({
    fieldId: 1n,
    date: "2026-07-15",
    time: "18:30",
    durationMinutes: 60n,
    playerCount: 10n,
    teamName: "Les Aigles",
  });
  expect(created.status).toEqual({ pending: null });
  expect(created.priceDt).toBe(5.6);

  const paid = await actor.confirmBookingPayment(created.id, "SBX-TEST-4242");
  expect(paid).toMatchObject({
    ok: expect.objectContaining({
      id: created.id,
      status: { paid: null },
      paymentReference: ["SBX-TEST-4242"],
    }),
  });

  const read = await actor.getBooking(created.id);
  expect(read).toHaveLength(1);
  expect(read[0]).toMatchObject({ status: { paid: null } });
});

it("creates a team with the caller as captain and a match with a share card", async () => {
  actor.setIdentity(alice);
  const team = await actor.createTeam({
    name: "Les Aigles de Mahdia",
    color: "#16a34a",
    description: "Equipe locale",
    level: { intermediate: null },
    logoUrl: [],
  });
  expect(team.name).toBe("Les Aigles de Mahdia");
  expect(team.playerCount).toBe(1n);
  expect(team.memberIds).toHaveLength(1);

  const match = await actor.createMatch({
    homeTeamId: team.id,
    awayTeamId: team.id,
    date: "2026-07-20",
    time: "20:00",
    fieldId: 1n,
    playerCount: 10n,
    level: { intermediate: null },
    pricePerPlayerDt: 5.6,
  });
  expect(match.status).toEqual({ scheduled: null });

  const card = await actor.getMatchShareCard(match.id);
  expect(card).toHaveLength(1);
  expect(card[0]).toMatchObject({
    homeTeamName: "Les Aigles de Mahdia",
    fieldName: "ISET Mahdia",
  });
  expect(card[0].shareUrl).toContain(match.id.toString());
});

it("registers a caller and reads the profile back", async () => {
  actor.setIdentity(alice);
  const result = await actor.register({
    username: "ala",
    city: "Mahdia",
    password: "secret123",
    photoUrl: [],
    email: "ala@example.com",
    level: { intermediate: null },
    phone: "+21600000000",
    position: { midfielder: null },
    lastName: "Manaa",
    firstName: "Ala",
  });
  expect(result).toMatchObject({
    ok: expect.objectContaining({ username: "ala", role: { user: null } }),
  });

  const account = await actor.getCallerAccount();
  expect(account).toHaveLength(1);
  expect(account[0]).toMatchObject({ username: "ala" });

  const profile = await actor.getPlayerProfile(account[0].id);
  expect(profile).toHaveLength(1);
  expect(profile[0].account.username).toBe("ala");
});

it("rejects an anonymous caller from creating a team", async () => {
  // A freshly created actor calls as the anonymous principal until an identity is set.
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(
    guest.createTeam({
      name: "Anonymes",
      color: "#000000",
      description: "",
      level: { beginner: null },
      logoUrl: [],
    }),
  ).rejects.toThrow();
});
