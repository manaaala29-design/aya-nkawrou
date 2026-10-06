import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/teams";
import AccountTypes "../types/accounts";
import TeamsLib "../lib/teams";

mixin (
  accessControlState : AccessControl.AccessControlState,
  teams : Map.Map<Nat, Types.Team>,
  teamState : { var nextTeamId : Nat },
  memberships : Map.Map<Principal, [Nat]>,
  availability : Map.Map<Principal, Types.AvailabilityInput>,
  accounts : Map.Map<Principal, AccountTypes.Account>,
) {
  public shared ({ caller }) func createTeam(input : Types.CreateTeamInput) : async Types.TeamView {
    if (caller.isAnonymous()) { Runtime.trap("Authentification requise") };
    TeamsLib.createTeam(teams, teamState, memberships, caller, input);
  };

  public query ({ caller }) func listTeams() : async [Types.TeamView] {
    ignore caller;
    TeamsLib.listTeams(teams);
  };

  public query ({ caller }) func getTeam(teamId : Nat) : async ?Types.TeamView {
    ignore caller;
    TeamsLib.getTeam(teams, teamId);
  };

  public shared ({ caller }) func addTeamPlayer(teamId : Nat, player : Principal) : async Bool {
    if (caller.isAnonymous()) { Runtime.trap("Authentification requise") };
    TeamsLib.addPlayer(teams, memberships, caller, teamId, player);
  };

  public shared ({ caller }) func removeTeamPlayer(teamId : Nat, player : Principal) : async Bool {
    if (caller.isAnonymous()) { Runtime.trap("Authentification requise") };
    TeamsLib.removePlayer(teams, memberships, caller, teamId, player);
  };

  public shared ({ caller }) func setTeamCaptain(teamId : Nat, newCaptain : Principal) : async Bool {
    if (caller.isAnonymous()) { Runtime.trap("Authentification requise") };
    TeamsLib.setCaptain(teams, caller, teamId, newCaptain);
  };

  public query ({ caller }) func searchPlayers(filter : Types.PlayerSearchFilter) : async [Types.AvailablePlayer] {
    ignore caller;
    TeamsLib.searchPlayers(accounts, availability, filter);
  };

  public shared ({ caller }) func setMyAvailability(input : Types.AvailabilityInput) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Authentification requise") };
    TeamsLib.setAvailability(availability, caller, input);
  };
};
