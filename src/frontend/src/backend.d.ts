import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AccountView {
    id: UserId;
    username: string;
    city: string;
    createdAt: Timestamp;
    role: UserRole;
    banned: boolean;
    photoUrl?: string;
    email: string;
    level: PlayerLevel;
    phone: string;
    position: PlayerPosition;
    lastName: string;
    firstName: string;
}
export interface AdminOverview {
    bookingsByStatus: Array<[string, bigint]>;
    stats: AdminStats;
    revenueByMonth: Array<RevenuePoint>;
}
export interface AdminStats {
    totalTeams: bigint;
    totalMatches: bigint;
    totalPlayers: bigint;
    totalBookings: bigint;
    totalRevenueDt: number;
    totalUsers: bigint;
}
export type AuthResult = {
    __kind__: "ok";
    ok: AccountView;
} | {
    __kind__: "err";
    err: string;
};
export interface AvailabilityInput {
    available: boolean;
    availableAt?: string;
}
export interface AvailablePlayer {
    username: string;
    city: string;
    userId: UserId;
    level: PlayerLevel;
    available: boolean;
    rating: number;
    position: PlayerPosition;
    availableAt?: string;
}
export type BookingId = bigint;
export interface BookingView {
    id: BookingId;
    status: BookingStatus;
    teamName: string;
    userId: UserId;
    date: string;
    createdAt: Timestamp;
    time: string;
    playerCount: bigint;
    priceDt: number;
    durationMinutes: bigint;
    paymentReference?: string;
    fieldId: FieldId;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface CreateBookingInput {
    teamName: string;
    date: string;
    time: string;
    playerCount: bigint;
    durationMinutes: bigint;
    fieldId: FieldId;
}
export interface CreateMatchInput {
    awayTeamId: TeamId;
    date: string;
    time: string;
    playerCount: bigint;
    homeTeamId: TeamId;
    level: PlayerLevel;
    pricePerPlayerDt: number;
    fieldId: FieldId;
}
export interface CreateTeamInput {
    name: string;
    color: string;
    description: string;
    level: PlayerLevel;
    logoUrl?: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface FieldFilter {
    minRating?: number;
    maxPrice?: number;
    maxDistanceKm?: number;
    timeSlot?: string;
}
export type FieldId = bigint;
export interface FieldView {
    id: FieldId;
    timeSlots: Array<string>;
    name: string;
    available: boolean;
    priceDt: number;
    imageUrl?: string;
    distanceKm: number;
    rating: number;
    location: string;
}
export type MatchId = bigint;
export interface MatchView {
    id: MatchId;
    status: MatchStatus;
    awayTeamId: TeamId;
    date: string;
    createdAt: Timestamp;
    time: string;
    playerCount: bigint;
    homeTeamId: TeamId;
    invitedPlayerIds: Array<UserId>;
    level: PlayerLevel;
    pricePerPlayerDt: number;
    fieldId: FieldId;
}
export type PaymentResult = {
    __kind__: "ok";
    ok: BookingView;
} | {
    __kind__: "err";
    err: string;
};
export interface PlayerProfile {
    teamIds: Array<bigint>;
    stats: PlayerStats;
    achievements: Array<string>;
    account: AccountView;
}
export interface PlayerSearchFilter {
    minRating?: number;
    availableToday: boolean;
    city?: string;
    level?: PlayerLevel;
    position?: PlayerPosition;
    availableAt?: string;
}
export interface PlayerStats {
    assists: bigint;
    wins: bigint;
    goals: bigint;
    matchesPlayed: bigint;
    rating: number;
}
export interface RegisterInput {
    username: string;
    city: string;
    password: string;
    photoUrl?: string;
    email: string;
    level: PlayerLevel;
    phone: string;
    position: PlayerPosition;
    lastName: string;
    firstName: string;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface RevenuePoint {
    monthLabel: string;
    amountDt: number;
}
export interface ShareCard {
    date: string;
    shareUrl: string;
    awayTeamName: string;
    time: string;
    homeTeamName: string;
    fieldName: string;
    location: string;
}
export type TeamId = bigint;
export interface TeamView {
    id: TeamId;
    name: string;
    createdAt: Timestamp;
    color: string;
    playerCount: bigint;
    description: string;
    level: PlayerLevel;
    logoUrl?: string;
    captain: UserId;
    memberIds: Array<UserId>;
}
export type Timestamp = bigint;
export interface UpdateProfileInput {
    username: string;
    city: string;
    photoUrl?: string;
    email: string;
    level: PlayerLevel;
    phone: string;
    position: PlayerPosition;
    lastName: string;
    firstName: string;
}
export type UserId = Principal;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    paid = "paid"
}
export enum MatchStatus {
    scheduled = "scheduled",
    cancelled = "cancelled",
    completed = "completed"
}
export enum PlayerLevel {
    intermediate = "intermediate",
    beginner = "beginner",
    good = "good",
    professional = "professional"
}
export enum PlayerPosition {
    goalkeeper = "goalkeeper",
    winger = "winger",
    midfielder = "midfielder",
    defender = "defender",
    striker = "striker"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    captain = "captain",
    referee = "referee",
    volunteer = "volunteer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTeamPlayer(teamId: bigint, player: Principal): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    cancelBooking(bookingId: bigint): Promise<boolean>;
    confirmBookingPayment(bookingId: bigint, paymentReference: string): Promise<PaymentResult>;
    createBooking(input: CreateBookingInput): Promise<BookingView>;
    createMatch(input: CreateMatchInput): Promise<MatchView>;
    createTeam(input: CreateTeamInput): Promise<TeamView>;
    execute(qJson: string): Promise<Result>;
    getAccount(user: Principal): Promise<AccountView | null>;
    getAdminOverview(): Promise<AdminOverview>;
    getApiDoc(): Promise<string>;
    getBooking(bookingId: bigint): Promise<BookingView | null>;
    getCallerAccount(): Promise<AccountView | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getField(id: bigint): Promise<FieldView | null>;
    getMatch(matchId: bigint): Promise<MatchView | null>;
    getMatchShareCard(matchId: bigint): Promise<ShareCard | null>;
    getPlayerProfile(user: Principal): Promise<PlayerProfile | null>;
    getTeam(teamId: bigint): Promise<TeamView | null>;
    inviteMatchPlayers(matchId: bigint, players: Array<Principal>): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listAccounts(): Promise<Array<AccountView>>;
    listAllBookings(): Promise<Array<BookingView>>;
    listFields(filter: FieldFilter): Promise<Array<FieldView>>;
    listMatches(): Promise<Array<MatchView>>;
    listMyBookings(): Promise<Array<BookingView>>;
    listTeams(): Promise<Array<TeamView>>;
    login(password: string): Promise<AuthResult>;
    register(input: RegisterInput): Promise<AuthResult>;
    removeTeamPlayer(teamId: bigint, player: Principal): Promise<boolean>;
    schema(): Promise<string>;
    searchPlayers(filter: PlayerSearchFilter): Promise<Array<AvailablePlayer>>;
    setAccountBanned(user: Principal, banned: boolean): Promise<boolean>;
    setFieldAvailability(id: bigint, available: boolean): Promise<boolean>;
    setMyAvailability(input: AvailabilityInput): Promise<void>;
    setTeamCaptain(teamId: bigint, newCaptain: Principal): Promise<boolean>;
    updateProfile(input: UpdateProfileInput): Promise<AuthResult>;
}
