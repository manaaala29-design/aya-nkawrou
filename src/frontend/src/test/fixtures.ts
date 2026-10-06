import type {
  AccountView,
  AdminOverview,
  AvailablePlayer,
  BookingView,
  FieldView,
  MatchView,
  PlayerProfile,
  ShareCard,
  TeamView,
} from "@/types";
import {
  BookingStatus,
  MatchStatus,
  PlayerLevel,
  PlayerPosition,
  UserRole,
} from "@/types";
import { Principal } from "@icp-sdk/core/principal";

export const USER_ID = Principal.fromText("2vxsx-fae");
export const OTHER_ID = Principal.fromText("aaaaa-aa");

export function makeAccount(overrides: Partial<AccountView> = {}): AccountView {
  return {
    id: USER_ID,
    username: "ala",
    city: "Mahdia",
    createdAt: 1_700_000_000_000_000_000n,
    role: UserRole.user,
    banned: false,
    email: "ala@example.com",
    level: PlayerLevel.intermediate,
    phone: "+21600000000",
    position: PlayerPosition.midfielder,
    lastName: "Manaa",
    firstName: "Ala",
    ...overrides,
  };
}

export function makeField(overrides: Partial<FieldView> = {}): FieldView {
  return {
    id: 1n,
    timeSlots: ["17:00", "18:30", "20:00", "21:30"],
    name: "ISET Mahdia",
    available: true,
    priceDt: 5.6,
    imageUrl: "https://example.com/field.jpg",
    distanceKm: 1.2,
    rating: 4.3,
    location: "ISET Mahdia, Mahdia",
    ...overrides,
  };
}

/** The seven seeded Mahdia fields, mirroring `src/backend/lib/fields.mo`. */
export function makeSevenFields(): FieldView[] {
  const seed: Array<{
    name: string;
    location: string;
    distanceKm: number;
    rating: number;
    timeSlots: string[];
  }> = [
    {
      name: "ISET Mahdia",
      location: "ISET Mahdia, Mahdia",
      distanceKm: 1.2,
      rating: 4.3,
      timeSlots: ["17:00", "18:30", "20:00", "21:30"],
    },
    {
      name: "ISIMA",
      location: "ISIMA, Mahdia",
      distanceKm: 2.0,
      rating: 4.1,
      timeSlots: ["16:00", "17:30", "19:00", "20:30"],
    },
    {
      name: "Stade Hiboun",
      location: "Hiboun, Mahdia",
      distanceKm: 3.5,
      rating: 4.5,
      timeSlots: ["15:00", "17:00", "19:00", "21:00"],
    },
    {
      name: "Stade Mahdia",
      location: "Centre-ville, Mahdia",
      distanceKm: 0.8,
      rating: 4.6,
      timeSlots: ["16:30", "18:00", "19:30", "21:00"],
    },
    {
      name: "Stade Olympique de Mahdia",
      location: "Route de Sfax, Mahdia",
      distanceKm: 2.7,
      rating: 4.8,
      timeSlots: ["14:00", "16:00", "18:00", "20:00"],
    },
    {
      name: "Stade Rejich",
      location: "Rejich, Mahdia",
      distanceKm: 5.4,
      rating: 4.0,
      timeSlots: ["15:30", "17:30", "19:30"],
    },
    {
      name: "Stade Makarem Mahdia",
      location: "Makarem, Mahdia",
      distanceKm: 4.1,
      rating: 4.2,
      timeSlots: ["16:00", "18:00", "20:00", "21:30"],
    },
  ];
  return seed.map((entry, index) =>
    makeField({
      id: BigInt(index + 1),
      name: entry.name,
      location: entry.location,
      distanceKm: entry.distanceKm,
      rating: entry.rating,
      timeSlots: entry.timeSlots,
      available: true,
      imageUrl: undefined,
    }),
  );
}

export function makeBooking(overrides: Partial<BookingView> = {}): BookingView {
  return {
    id: 42n,
    status: BookingStatus.pending,
    teamName: "Les Aigles",
    userId: USER_ID,
    date: "2026-07-15",
    createdAt: 1_700_000_000_000_000_000n,
    time: "18:00",
    playerCount: 10n,
    priceDt: 5.6,
    durationMinutes: 60n,
    fieldId: 1n,
    ...overrides,
  };
}

export function makeTeam(overrides: Partial<TeamView> = {}): TeamView {
  return {
    id: 7n,
    name: "Les Aigles de Mahdia",
    createdAt: 1_700_000_000_000_000_000n,
    color: "#16a34a",
    playerCount: 11n,
    description: "Equipe locale",
    level: PlayerLevel.intermediate,
    captain: USER_ID,
    memberIds: [USER_ID, OTHER_ID],
    ...overrides,
  };
}

export function makeMatch(overrides: Partial<MatchView> = {}): MatchView {
  return {
    id: 99n,
    status: MatchStatus.scheduled,
    awayTeamId: 8n,
    date: "2026-07-20",
    createdAt: 1_700_000_000_000_000_000n,
    time: "20:00",
    playerCount: 10n,
    homeTeamId: 7n,
    invitedPlayerIds: [],
    level: PlayerLevel.intermediate,
    pricePerPlayerDt: 5.6,
    fieldId: 1n,
    ...overrides,
  };
}

export function makePlayer(
  overrides: Partial<AvailablePlayer> = {},
): AvailablePlayer {
  return {
    username: "sami",
    city: "Mahdia",
    userId: OTHER_ID,
    level: PlayerLevel.good,
    available: true,
    rating: 4.2,
    position: PlayerPosition.striker,
    ...overrides,
  };
}

export function makeShareCard(overrides: Partial<ShareCard> = {}): ShareCard {
  return {
    date: "2026-07-20",
    shareUrl: "https://ayankawrou.example/match/99",
    awayTeamName: "Les Lions",
    time: "20:00",
    homeTeamName: "Les Aigles de Mahdia",
    fieldName: "Terrain Hiboun",
    location: "Hiboun, Mahdia",
    ...overrides,
  };
}

export function makePlayerProfile(
  overrides: Partial<PlayerProfile> = {},
): PlayerProfile {
  return {
    teamIds: [7n],
    stats: {
      assists: 3n,
      wins: 5n,
      goals: 12n,
      matchesPlayed: 9n,
      rating: 4.2,
    },
    achievements: ["Top buteur"],
    account: makeAccount(),
    ...overrides,
  };
}

export function makeAdminOverview(
  overrides: Partial<AdminOverview> = {},
): AdminOverview {
  return {
    bookingsByStatus: [
      [BookingStatus.paid, 12n],
      [BookingStatus.pending, 3n],
    ],
    stats: {
      totalTeams: 4n,
      totalMatches: 6n,
      totalPlayers: 25n,
      totalBookings: 15n,
      totalRevenueDt: 84,
      totalUsers: 30n,
    },
    revenueByMonth: [
      { monthLabel: "2026-05", amountDt: 28 },
      { monthLabel: "2026-06", amountDt: 56 },
    ],
    ...overrides,
  };
}
