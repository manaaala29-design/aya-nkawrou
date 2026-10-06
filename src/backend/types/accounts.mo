import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;
  public type PlayerPosition = Common.PlayerPosition;
  public type PlayerLevel = Common.PlayerLevel;
  public type UserRole = Common.UserRole;

  public type Account = {
    id : UserId;
    firstName : Text;
    lastName : Text;
    username : Text;
    email : Text;
    phone : Text;
    passwordHash : Text;
    photoUrl : ?Text;
    city : Text;
    position : PlayerPosition;
    level : PlayerLevel;
    role : UserRole;
    banned : Bool;
    createdAt : Timestamp;
  };

  public type AccountView = {
    id : UserId;
    firstName : Text;
    lastName : Text;
    username : Text;
    email : Text;
    phone : Text;
    photoUrl : ?Text;
    city : Text;
    position : PlayerPosition;
    level : PlayerLevel;
    role : UserRole;
    banned : Bool;
    createdAt : Timestamp;
  };

  public type PlayerStats = {
    matchesPlayed : Nat;
    wins : Nat;
    goals : Nat;
    assists : Nat;
    rating : Float;
  };

  public type PlayerProfile = {
    account : AccountView;
    stats : PlayerStats;
    teamIds : [Nat];
    achievements : [Text];
  };

  public type RegisterInput = {
    firstName : Text;
    lastName : Text;
    username : Text;
    email : Text;
    phone : Text;
    password : Text;
    photoUrl : ?Text;
    city : Text;
    position : PlayerPosition;
    level : PlayerLevel;
  };

  public type UpdateProfileInput = {
    firstName : Text;
    lastName : Text;
    username : Text;
    email : Text;
    phone : Text;
    photoUrl : ?Text;
    city : Text;
    position : PlayerPosition;
    level : PlayerLevel;
  };

  public type AuthResult = {
    #ok : AccountView;
    #err : Text;
  };
};
