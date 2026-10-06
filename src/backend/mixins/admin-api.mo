import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/admin";
import AccountTypes "../types/accounts";
import BookingTypes "../types/bookings";
import TeamTypes "../types/teams";
import MatchTypes "../types/matches";
import AdminLib "../lib/admin";

mixin (
  accessControlState : AccessControl.AccessControlState,
  accounts : Map.Map<Principal, AccountTypes.Account>,
  bookings : Map.Map<Nat, BookingTypes.Booking>,
  teams : Map.Map<Nat, TeamTypes.Team>,
  matches : Map.Map<Nat, MatchTypes.Match>,
) {
  public query ({ caller }) func getAdminOverview() : async Types.AdminOverview {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Accès réservé aux administrateurs");
    };
    AdminLib.getOverview(accounts, bookings, teams, matches);
  };
};
