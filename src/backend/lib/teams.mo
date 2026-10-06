import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/teams";
import AccountTypes "../types/accounts";

module {
  public func toView(team : Types.Team) : Types.TeamView {
    {
      id = team.id;
      name = team.name;
      logoUrl = team.logoUrl;
      color = team.color;
      captain = team.captain;
      description = team.description;
      level = team.level;
      playerCount = team.playerCount;
      memberIds = team.memberIds;
      createdAt = team.createdAt;
    };
  };

  public func createTeam(
    teams : Map.Map<Nat, Types.Team>,
    state : { var nextTeamId : Nat },
    memberships : Map.Map<Principal, [Nat]>,
    caller : Principal,
    input : Types.CreateTeamInput,
  ) : Types.TeamView {
    let id = state.nextTeamId;
    state.nextTeamId := id + 1;
    let team : Types.Team = {
      id;
      name = input.name;
      logoUrl = input.logoUrl;
      color = input.color;
      captain = caller;
      description = input.description;
      level = input.level;
      playerCount = 1;
      memberIds = [caller];
      createdAt = Time.now();
    };
    teams.add(id, team);
    let existing = memberships.get(caller) ?? [];
    memberships.add(caller, existing.concat([id]));
    toView(team);
  };

  public func listTeams(
    teams : Map.Map<Nat, Types.Team>,
  ) : [Types.TeamView] {
    teams.values().map(func t = toView(t)).toArray();
  };

  public func getTeam(
    teams : Map.Map<Nat, Types.Team>,
    id : Nat,
  ) : ?Types.TeamView {
    switch (teams.get(id)) {
      case (?team) { ?toView(team) };
      case null { null };
    };
  };

  public func addPlayer(
    teams : Map.Map<Nat, Types.Team>,
    memberships : Map.Map<Principal, [Nat]>,
    caller : Principal,
    teamId : Nat,
    player : Principal,
  ) : Bool {
    switch (teams.get(teamId)) {
      case (?team) {
        if (team.captain != caller) { return false };
        if (team.memberIds.contains(player)) { return false };
        let updated : Types.Team = {
          id = team.id;
          name = team.name;
          logoUrl = team.logoUrl;
          color = team.color;
          captain = team.captain;
          description = team.description;
          level = team.level;
          playerCount = team.playerCount + 1;
          memberIds = team.memberIds.concat([player]);
          createdAt = team.createdAt;
        };
        teams.add(teamId, updated);
        let existing = memberships.get(player) ?? [];
        memberships.add(player, existing.concat([teamId]));
        true;
      };
      case null { false };
    };
  };

  public func removePlayer(
    teams : Map.Map<Nat, Types.Team>,
    memberships : Map.Map<Principal, [Nat]>,
    caller : Principal,
    teamId : Nat,
    player : Principal,
  ) : Bool {
    switch (teams.get(teamId)) {
      case (?team) {
        if (team.captain != caller) { return false };
        if (player == team.captain) { return false };
        if (not team.memberIds.contains(player)) { return false };
        let updated : Types.Team = {
          id = team.id;
          name = team.name;
          logoUrl = team.logoUrl;
          color = team.color;
          captain = team.captain;
          description = team.description;
          level = team.level;
          playerCount = team.playerCount - 1;
          memberIds = team.memberIds.filter(func p = p != player);
          createdAt = team.createdAt;
        };
        teams.add(teamId, updated);
        let existing = memberships.get(player) ?? [];
        memberships.add(player, existing.filter(func id = id != teamId));
        true;
      };
      case null { false };
    };
  };

  public func setCaptain(
    teams : Map.Map<Nat, Types.Team>,
    caller : Principal,
    teamId : Nat,
    newCaptain : Principal,
  ) : Bool {
    switch (teams.get(teamId)) {
      case (?team) {
        if (team.captain != caller) { return false };
        if (not team.memberIds.contains(newCaptain)) { return false };
        let updated : Types.Team = {
          id = team.id;
          name = team.name;
          logoUrl = team.logoUrl;
          color = team.color;
          captain = newCaptain;
          description = team.description;
          level = team.level;
          playerCount = team.playerCount;
          memberIds = team.memberIds;
          createdAt = team.createdAt;
        };
        teams.add(teamId, updated);
        true;
      };
      case null { false };
    };
  };

  public func searchPlayers(
    accounts : Map.Map<Principal, AccountTypes.Account>,
    availability : Map.Map<Principal, Types.AvailabilityInput>,
    filter : Types.PlayerSearchFilter,
  ) : [Types.AvailablePlayer] {
    let results = accounts.values().filter(
      func account {
        if (account.banned) { return false };
        switch (filter.position) {
          case (?pos) { if (account.position != pos) { return false } };
          case null {};
        };
        switch (filter.level) {
          case (?lvl) { if (account.level != lvl) { return false } };
          case null {};
        };
        switch (filter.city) {
          case (?city) {
            if (not account.city.toLower().contains(#text (city.toLower()))) { return false };
          };
          case null {};
        };
        let avail = availability.get(account.id);
        if (filter.availableToday) {
          switch (avail) {
            case (?a) { if (not a.available) { return false } };
            case null { return false };
          };
        };
        switch (filter.availableAt) {
          case (?at) {
            switch (avail) {
              case (?a) {
                switch (a.availableAt) {
                  case (?slot) { if (slot != at) { return false } };
                  case null { return false };
                };
              };
              case null { return false };
            };
          };
          case null {};
        };
        true;
      }
    );
    results.map(
      func account {
        let avail = availability.get(account.id);
        let (available, availableAt) = switch (avail) {
          case (?a) { (a.available, a.availableAt) };
          case null { (false, null) };
        };
        {
          userId = account.id;
          username = account.username;
          city = account.city;
          position = account.position;
          level = account.level;
          rating = 0.0;
          available;
          availableAt;
        };
      }
    ).toArray();
  };

  public func setAvailability(
    availability : Map.Map<Principal, Types.AvailabilityInput>,
    caller : Principal,
    input : Types.AvailabilityInput,
  ) : () {
    availability.add(caller, input);
  };
};
