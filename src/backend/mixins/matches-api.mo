import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/matches";
import TeamTypes "../types/teams";
import FieldTypes "../types/fields";
import MatchesLib "../lib/matches";

mixin (
  accessControlState : AccessControl.AccessControlState,
  matches : Map.Map<Nat, Types.Match>,
  matchState : { var nextMatchId : Nat },
  teams : Map.Map<Nat, TeamTypes.Team>,
  fields : Map.Map<Nat, FieldTypes.Field>,
) {
  public shared ({ caller }) func createMatch(input : Types.CreateMatchInput) : async Types.MatchView {
    if (caller.isAnonymous()) { Runtime.trap("Authentification requise") };
    MatchesLib.createMatch(matches, matchState, teams, caller, input);
  };

  public query ({ caller }) func listMatches() : async [Types.MatchView] {
    ignore caller;
    MatchesLib.listMatches(matches);
  };

  public query ({ caller }) func getMatch(matchId : Nat) : async ?Types.MatchView {
    ignore caller;
    MatchesLib.getMatch(matches, matchId);
  };

  public shared ({ caller }) func inviteMatchPlayers(matchId : Nat, players : [Principal]) : async Bool {
    if (caller.isAnonymous()) { Runtime.trap("Authentification requise") };
    MatchesLib.invitePlayers(matches, caller, matchId, players);
  };

  public query ({ caller }) func getMatchShareCard(matchId : Nat) : async ?Types.ShareCard {
    ignore caller;
    MatchesLib.getShareCard(matches, teams, fields, matchId);
  };
};
