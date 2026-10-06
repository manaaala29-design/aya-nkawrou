import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/accounts";
import AccountsLib "../lib/accounts";

mixin (
  accessControlState : AccessControl.AccessControlState,
  accounts : Map.Map<Principal, Types.Account>,
  usernames : Map.Map<Text, Principal>,
  emails : Map.Map<Text, Principal>,
  stats : Map.Map<Principal, Types.PlayerStats>,
  memberships : Map.Map<Principal, [Nat]>,
  achievements : Map.Map<Principal, [Text]>,
) {
  public shared ({ caller }) func register(input : Types.RegisterInput) : async Types.AuthResult {
    AccountsLib.register(accounts, usernames, emails, caller, input);
  };

  public shared ({ caller }) func login(password : Text) : async Types.AuthResult {
    AccountsLib.login(accounts, caller, password);
  };

  public query ({ caller }) func getCallerAccount() : async ?Types.AccountView {
    AccountsLib.getAccount(accounts, caller);
  };

  public query ({ caller }) func getAccount(user : Principal) : async ?Types.AccountView {
    ignore caller;
    AccountsLib.getAccount(accounts, user);
  };

  public shared ({ caller }) func updateProfile(input : Types.UpdateProfileInput) : async Types.AuthResult {
    AccountsLib.updateProfile(accounts, usernames, emails, caller, input);
  };

  public query ({ caller }) func getPlayerProfile(user : Principal) : async ?Types.PlayerProfile {
    ignore caller;
    AccountsLib.getPlayerProfile(accounts, stats, memberships, achievements, user);
  };

  public query ({ caller }) func listAccounts() : async [Types.AccountView] {
    if (not isAdminCaller(caller)) {
      return [];
    };
    AccountsLib.listAccounts(accounts);
  };

  public shared ({ caller }) func setAccountBanned(user : Principal, banned : Bool) : async Bool {
    if (not isAdminCaller(caller)) {
      return false;
    };
    AccountsLib.setBanned(accounts, caller, user, banned);
  };

  // Non-trapping admin check: an unregistered or anonymous caller is not admin.
  func isAdminCaller(caller : Principal) : Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { true };
      case _ { false };
    };
  };
};
