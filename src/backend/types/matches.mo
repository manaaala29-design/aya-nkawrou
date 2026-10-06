import Common "common";

module {
  public type MatchId = Common.MatchId;
  public type TeamId = Common.TeamId;
  public type FieldId = Common.FieldId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;
  public type PlayerLevel = Common.PlayerLevel;

  public type MatchStatus = {
    #scheduled;
    #completed;
    #cancelled;
  };

  public type Match = {
    id : MatchId;
    homeTeamId : TeamId;
    awayTeamId : TeamId;
    date : Text;
    time : Text;
    fieldId : FieldId;
    playerCount : Nat;
    level : PlayerLevel;
    pricePerPlayerDt : Float;
    status : MatchStatus;
    invitedPlayerIds : [UserId];
    createdAt : Timestamp;
  };

  public type MatchView = {
    id : MatchId;
    homeTeamId : TeamId;
    awayTeamId : TeamId;
    date : Text;
    time : Text;
    fieldId : FieldId;
    playerCount : Nat;
    level : PlayerLevel;
    pricePerPlayerDt : Float;
    status : MatchStatus;
    invitedPlayerIds : [UserId];
    createdAt : Timestamp;
  };

  public type CreateMatchInput = {
    homeTeamId : TeamId;
    awayTeamId : TeamId;
    date : Text;
    time : Text;
    fieldId : FieldId;
    playerCount : Nat;
    level : PlayerLevel;
    pricePerPlayerDt : Float;
  };

  public type ShareCard = {
    homeTeamName : Text;
    awayTeamName : Text;
    fieldName : Text;
    date : Text;
    time : Text;
    location : Text;
    shareUrl : Text;
  };
};
