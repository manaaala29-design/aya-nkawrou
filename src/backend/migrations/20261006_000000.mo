import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type PlayerPosition = {
    #goalkeeper;
    #defender;
    #midfielder;
    #winger;
    #striker;
  };

  type PlayerLevel = {
    #beginner;
    #intermediate;
    #good;
    #professional;
  };

  type UserRole = {
    #user;
    #captain;
    #referee;
    #volunteer;
    #admin;
  };

  type Account = {
    id : Principal;
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
    createdAt : Int;
  };

  type PlayerStats = {
    matchesPlayed : Nat;
    wins : Nat;
    goals : Nat;
    assists : Nat;
    rating : Float;
  };

  type Field = {
    id : Nat;
    name : Text;
    location : Text;
    distanceKm : Float;
    rating : Float;
    available : Bool;
    priceDt : Float;
    timeSlots : [Text];
    imageUrl : ?Text;
  };

  type BookingStatus = {
    #pending;
    #paid;
    #cancelled;
  };

  type Booking = {
    id : Nat;
    userId : Principal;
    fieldId : Nat;
    date : Text;
    time : Text;
    durationMinutes : Nat;
    playerCount : Nat;
    teamName : Text;
    priceDt : Float;
    status : BookingStatus;
    paymentReference : ?Text;
    createdAt : Int;
  };

  type Team = {
    id : Nat;
    name : Text;
    logoUrl : ?Text;
    color : Text;
    captain : Principal;
    description : Text;
    level : PlayerLevel;
    playerCount : Nat;
    memberIds : [Principal];
    createdAt : Int;
  };

  type AvailabilityInput = {
    available : Bool;
    availableAt : ?Text;
  };

  type MatchStatus = {
    #scheduled;
    #completed;
    #cancelled;
  };

  type Match = {
    id : Nat;
    homeTeamId : Nat;
    awayTeamId : Nat;
    date : Text;
    time : Text;
    fieldId : Nat;
    playerCount : Nat;
    level : PlayerLevel;
    pricePerPlayerDt : Float;
    status : MatchStatus;
    invitedPlayerIds : [Principal];
    createdAt : Int;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    accounts : Map.Map<Principal, Account>;
    usernames : Map.Map<Text, Principal>;
    emails : Map.Map<Text, Principal>;
    stats : Map.Map<Principal, PlayerStats>;
    memberships : Map.Map<Principal, [Nat]>;
    achievements : Map.Map<Principal, [Text]>;
    fields : Map.Map<Nat, Field>;
    bookings : Map.Map<Nat, Booking>;
    bookingState : { var nextBookingId : Nat };
    teams : Map.Map<Nat, Team>;
    teamState : { var nextTeamId : Nat };
    availability : Map.Map<Principal, AvailabilityInput>;
    matches : Map.Map<Nat, Match>;
    matchState : { var nextMatchId : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      accounts = Map.empty();
      usernames = Map.empty();
      emails = Map.empty();
      stats = Map.empty();
      memberships = Map.empty();
      achievements = Map.empty();
      fields = Map.empty();
      bookings = Map.empty();
      bookingState = { var nextBookingId = 0 };
      teams = Map.empty();
      teamState = { var nextTeamId = 0 };
      availability = Map.empty();
      matches = Map.empty();
      matchState = { var nextMatchId = 0 };
    };
  };
};
