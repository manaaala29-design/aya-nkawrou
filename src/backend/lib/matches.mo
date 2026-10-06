import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/matches";
import TeamTypes "../types/teams";
import FieldTypes "../types/fields";

module {
  public func toView(match : Types.Match) : Types.MatchView {
    {
      id = match.id;
      homeTeamId = match.homeTeamId;
      awayTeamId = match.awayTeamId;
      date = match.date;
      time = match.time;
      fieldId = match.fieldId;
      playerCount = match.playerCount;
      level = match.level;
      pricePerPlayerDt = match.pricePerPlayerDt;
      status = match.status;
      invitedPlayerIds = match.invitedPlayerIds;
      createdAt = match.createdAt;
    };
  };

  public func createMatch(
    matches : Map.Map<Nat, Types.Match>,
    state : { var nextMatchId : Nat },
    teams : Map.Map<Nat, TeamTypes.Team>,
    caller : Principal,
    input : Types.CreateMatchInput,
  ) : Types.MatchView {
    switch (teams.get(input.homeTeamId)) {
      case (?home) {
        if (home.captain != caller) {
          return {
            id = 0;
            homeTeamId = input.homeTeamId;
            awayTeamId = input.awayTeamId;
            date = input.date;
            time = input.time;
            fieldId = input.fieldId;
            playerCount = input.playerCount;
            level = input.level;
            pricePerPlayerDt = input.pricePerPlayerDt;
            status = #cancelled;
            invitedPlayerIds = [];
            createdAt = 0;
          };
        };
      };
      case null {
        return {
          id = 0;
          homeTeamId = input.homeTeamId;
          awayTeamId = input.awayTeamId;
          date = input.date;
          time = input.time;
          fieldId = input.fieldId;
          playerCount = input.playerCount;
          level = input.level;
          pricePerPlayerDt = input.pricePerPlayerDt;
          status = #cancelled;
          invitedPlayerIds = [];
          createdAt = 0;
        };
      };
    };
    let id = state.nextMatchId;
    state.nextMatchId := id + 1;
    let match : Types.Match = {
      id;
      homeTeamId = input.homeTeamId;
      awayTeamId = input.awayTeamId;
      date = input.date;
      time = input.time;
      fieldId = input.fieldId;
      playerCount = input.playerCount;
      level = input.level;
      pricePerPlayerDt = input.pricePerPlayerDt;
      status = #scheduled;
      invitedPlayerIds = [];
      createdAt = Time.now();
    };
    matches.add(id, match);
    toView(match);
  };

  public func listMatches(
    matches : Map.Map<Nat, Types.Match>,
  ) : [Types.MatchView] {
    matches.values().map(func m = toView(m)).toArray();
  };

  public func getMatch(
    matches : Map.Map<Nat, Types.Match>,
    id : Nat,
  ) : ?Types.MatchView {
    switch (matches.get(id)) {
      case (?match) { ?toView(match) };
      case null { null };
    };
  };

  public func invitePlayers(
    matches : Map.Map<Nat, Types.Match>,
    _caller : Principal,
    matchId : Nat,
    players : [Principal],
  ) : Bool {
    switch (matches.get(matchId)) {
      case (?match) {
        let updated : Types.Match = {
          id = match.id;
          homeTeamId = match.homeTeamId;
          awayTeamId = match.awayTeamId;
          date = match.date;
          time = match.time;
          fieldId = match.fieldId;
          playerCount = match.playerCount;
          level = match.level;
          pricePerPlayerDt = match.pricePerPlayerDt;
          status = match.status;
          invitedPlayerIds = match.invitedPlayerIds.concat(players);
          createdAt = match.createdAt;
        };
        matches.add(matchId, updated);
        true;
      };
      case null { false };
    };
  };

  public func getShareCard(
    matches : Map.Map<Nat, Types.Match>,
    teams : Map.Map<Nat, TeamTypes.Team>,
    fields : Map.Map<Nat, FieldTypes.Field>,
    matchId : Nat,
  ) : ?Types.ShareCard {
    switch (matches.get(matchId)) {
      case (?match) {
        let homeName = switch (teams.get(match.homeTeamId)) {
          case (?t) { t.name };
          case null { "Équipe " # match.homeTeamId.toText() };
        };
        let awayName = switch (teams.get(match.awayTeamId)) {
          case (?t) { t.name };
          case null { "Équipe " # match.awayTeamId.toText() };
        };
        let (fieldName, location) = switch (fields.get(match.fieldId)) {
          case (?f) { (f.name, f.location) };
          case null { ("Terrain " # match.fieldId.toText(), "") };
        };
        ?{
          homeTeamName = homeName;
          awayTeamName = awayName;
          fieldName;
          date = match.date;
          time = match.time;
          location;
          shareUrl = "/matches/" # match.id.toText();
        };
      };
      case null { null };
    };
  };
};
