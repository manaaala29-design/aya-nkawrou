module {
  public type UserId = Principal;
  public type Timestamp = Int;
  public type BookingId = Nat;
  public type TeamId = Nat;
  public type MatchId = Nat;
  public type FieldId = Nat;

  public type PlayerPosition = {
    #goalkeeper;
    #defender;
    #midfielder;
    #winger;
    #striker;
  };

  public type PlayerLevel = {
    #beginner;
    #intermediate;
    #good;
    #professional;
  };

  public type UserRole = {
    #user;
    #captain;
    #referee;
    #volunteer;
    #admin;
  };
};
