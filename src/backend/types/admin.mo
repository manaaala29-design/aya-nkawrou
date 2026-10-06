import Common "common";

module {
  public type UserId = Common.UserId;
  public type BookingId = Common.BookingId;
  public type TeamId = Common.TeamId;
  public type MatchId = Common.MatchId;
  public type FieldId = Common.FieldId;

  public type AdminStats = {
    totalUsers : Nat;
    totalBookings : Nat;
    totalRevenueDt : Float;
    totalMatches : Nat;
    totalTeams : Nat;
    totalPlayers : Nat;
  };

  public type RevenuePoint = {
    monthLabel : Text;
    amountDt : Float;
  };

  public type AdminOverview = {
    stats : AdminStats;
    revenueByMonth : [RevenuePoint];
    bookingsByStatus : [(Text, Nat)];
  };
};
