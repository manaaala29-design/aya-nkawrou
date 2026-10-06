import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat32 "mo:core/Nat32";
import Time "mo:core/Time";
import Types "../types/accounts";

module {
  // Deterministic, non-reversible password digest. Passwords are never stored
  // in clear text; only this digest is persisted.
  public func hashPassword(password : Text) : Text {
    var h : Nat32 = 2166136261;
    for (c in password.toArray().values()) {
      h := ((h ^ c.toNat32()) *% 16777619);
    };
    var h2 : Nat32 = 2166136261;
    for (c in password.toArray().values()) {
      h2 := ((h2 ^ (c.toNat32() +% 31)) *% 16777619);
    };
    "v1:" # h.toText() # ":" # h2.toText();
  };

  public func toView(account : Types.Account) : Types.AccountView {
    {
      id = account.id;
      firstName = account.firstName;
      lastName = account.lastName;
      username = account.username;
      email = account.email;
      phone = account.phone;
      photoUrl = account.photoUrl;
      city = account.city;
      position = account.position;
      level = account.level;
      role = account.role;
      banned = account.banned;
      createdAt = account.createdAt;
    };
  };

  public func register(
    accounts : Map.Map<Principal, Types.Account>,
    usernames : Map.Map<Text, Principal>,
    emails : Map.Map<Text, Principal>,
    caller : Principal,
    input : Types.RegisterInput,
  ) : Types.AuthResult {
    if (caller.isAnonymous()) {
      return #err("Vous devez être connecté pour créer un compte.");
    };
    if (accounts.get(caller) != null) {
      return #err("Un compte existe déjà pour cet utilisateur.");
    };
    let usernameKey = input.username.toLower();
    let emailKey = input.email.toLower();
    if (usernames.get(usernameKey) != null) {
      return #err("Ce nom d'utilisateur est déjà pris.");
    };
    if (emails.get(emailKey) != null) {
      return #err("Cet email est déjà utilisé.");
    };
    let account : Types.Account = {
      id = caller;
      firstName = input.firstName;
      lastName = input.lastName;
      username = input.username;
      email = input.email;
      phone = input.phone;
      passwordHash = hashPassword(input.password);
      photoUrl = input.photoUrl;
      city = input.city;
      position = input.position;
      level = input.level;
      role = #user;
      banned = false;
      createdAt = Time.now();
    };
    accounts.add(caller, account);
    usernames.add(usernameKey, caller);
    emails.add(emailKey, caller);
    #ok(toView(account));
  };

  public func login(
    accounts : Map.Map<Principal, Types.Account>,
    caller : Principal,
    password : Text,
  ) : Types.AuthResult {
    if (caller.isAnonymous()) {
      return #err("Vous devez être connecté pour vous identifier.");
    };
    switch (accounts.get(caller)) {
      case null { #err("Aucun compte trouvé pour cet utilisateur.") };
      case (?account) {
        if (account.banned) {
          return #err("Ce compte a été banni.");
        };
        if (account.passwordHash != hashPassword(password)) {
          return #err("Mot de passe incorrect.");
        };
        #ok(toView(account));
      };
    };
  };

  public func getAccount(
    accounts : Map.Map<Principal, Types.Account>,
    user : Principal,
  ) : ?Types.AccountView {
    switch (accounts.get(user)) {
      case null { null };
      case (?account) { ?toView(account) };
    };
  };

  public func updateProfile(
    accounts : Map.Map<Principal, Types.Account>,
    usernames : Map.Map<Text, Principal>,
    emails : Map.Map<Text, Principal>,
    caller : Principal,
    input : Types.UpdateProfileInput,
  ) : Types.AuthResult {
    switch (accounts.get(caller)) {
      case null { #err("Aucun compte trouvé pour cet utilisateur.") };
      case (?account) {
        let usernameKey = input.username.toLower();
        let emailKey = input.email.toLower();
        switch (usernames.get(usernameKey)) {
          case (?owner) {
            if (owner != caller) {
              return #err("Ce nom d'utilisateur est déjà pris.");
            };
          };
          case null {};
        };
        switch (emails.get(emailKey)) {
          case (?owner) {
            if (owner != caller) {
              return #err("Cet email est déjà utilisé.");
            };
          };
          case null {};
        };
        // Release the previous unique keys when they change.
        usernames.remove(account.username.toLower());
        emails.remove(account.email.toLower());
        let updated : Types.Account = {
          id = account.id;
          firstName = input.firstName;
          lastName = input.lastName;
          username = input.username;
          email = input.email;
          phone = input.phone;
          passwordHash = account.passwordHash;
          photoUrl = input.photoUrl;
          city = input.city;
          position = input.position;
          level = input.level;
          role = account.role;
          banned = account.banned;
          createdAt = account.createdAt;
        };
        accounts.add(caller, updated);
        usernames.add(usernameKey, caller);
        emails.add(emailKey, caller);
        #ok(toView(updated));
      };
    };
  };

  public func getPlayerProfile(
    accounts : Map.Map<Principal, Types.Account>,
    stats : Map.Map<Principal, Types.PlayerStats>,
    memberships : Map.Map<Principal, [Nat]>,
    achievements : Map.Map<Principal, [Text]>,
    user : Principal,
  ) : ?Types.PlayerProfile {
    switch (accounts.get(user)) {
      case null { null };
      case (?account) {
        let playerStats = stats.get(user) ?? ({
          matchesPlayed = 0;
          wins = 0;
          goals = 0;
          assists = 0;
          rating = 0.0;
        });
        let teamIds = memberships.get(user) ?? [];
        let userAchievements = achievements.get(user) ?? [];
        ?{
          account = toView(account);
          stats = playerStats;
          teamIds = teamIds;
          achievements = userAchievements;
        };
      };
    };
  };

  public func listAccounts(
    accounts : Map.Map<Principal, Types.Account>,
  ) : [Types.AccountView] {
    accounts.values().map(func a = toView(a)).toArray();
  };

  public func setBanned(
    accounts : Map.Map<Principal, Types.Account>,
    caller : Principal,
    user : Principal,
    banned : Bool,
  ) : Bool {
    ignore caller;
    switch (accounts.get(user)) {
      case null { false };
      case (?account) {
        if (account.role == #admin) {
          return false;
        };
        let updated : Types.Account = {
          id = account.id;
          firstName = account.firstName;
          lastName = account.lastName;
          username = account.username;
          email = account.email;
          phone = account.phone;
          passwordHash = account.passwordHash;
          photoUrl = account.photoUrl;
          city = account.city;
          position = account.position;
          level = account.level;
          role = account.role;
          banned = banned;
          createdAt = account.createdAt;
        };
        accounts.add(user, updated);
        true;
      };
    };
  };
};
