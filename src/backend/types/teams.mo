import Common "common";

module {
  public type TeamId = Common.TeamId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;
  public type PlayerPosition = Common.PlayerPosition;
  public type PlayerLevel = Common.PlayerLevel;

  public type Team = {
    id : TeamId;
    name : Text;
    logoUrl : ?Text;
    color : Text;
    captain : UserId;
    description : Text;
    level : PlayerLevel;
    playerCount : Nat;
    memberIds : [UserId];
    createdAt : Timestamp;
  };

  public type TeamView = {
    id : TeamId;
    name : Text;
    logoUrl : ?Text;
    color : Text;
    captain : UserId;
    description : Text;
    level : PlayerLevel;
    playerCount : Nat;
    memberIds : [UserId];
    createdAt : Timestamp;
  };

  public type CreateTeamInput = {
    name : Text;
    logoUrl : ?Text;
    color : Text;
    description : Text;
    level : PlayerLevel;
  };

  public type PlayerSearchFilter = {
    position : ?PlayerPosition;
    level : ?PlayerLevel;
    city : ?Text;
    minRating : ?Float;
    availableToday : Bool;
    availableAt : ?Text;
  };

  public type AvailablePlayer = {
    userId : UserId;
    username : Text;
    city : Text;
    position : PlayerPosition;
    level : PlayerLevel;
    rating : Float;
    available : Bool;
    availableAt : ?Text;
  };

  public type AvailabilityInput = {
    available : Bool;
    availableAt : ?Text;
  };
};
