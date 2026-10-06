import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Types "../types/admin";
import AccountTypes "../types/accounts";
import BookingTypes "../types/bookings";
import TeamTypes "../types/teams";
import MatchTypes "../types/matches";

module {
  public func getOverview(
    accounts : Map.Map<Principal, AccountTypes.Account>,
    bookings : Map.Map<Nat, BookingTypes.Booking>,
    teams : Map.Map<Nat, TeamTypes.Team>,
    matches : Map.Map<Nat, MatchTypes.Match>,
  ) : Types.AdminOverview {
    var totalUsers = 0;
    var totalPlayers = 0;
    for (account in accounts.values()) {
      totalUsers += 1;
      if (account.role == #user) {
        totalPlayers += 1;
      };
    };

    var totalBookings = 0;
    var totalRevenueDt = 0.0;
    var pendingCount = 0;
    var paidCount = 0;
    var cancelledCount = 0;
    for (booking in bookings.values()) {
      totalBookings += 1;
      switch (booking.status) {
        case (#pending) { pendingCount += 1 };
        case (#paid) {
          paidCount += 1;
          totalRevenueDt += booking.priceDt;
        };
        case (#cancelled) { cancelledCount += 1 };
      };
    };

    var totalTeams = 0;
    for (_team in teams.values()) {
      totalTeams += 1;
    };

    var totalMatches = 0;
    for (_match in matches.values()) {
      totalMatches += 1;
    };

    let stats : Types.AdminStats = {
      totalUsers;
      totalBookings;
      totalRevenueDt;
      totalMatches;
      totalTeams;
      totalPlayers;
    };

    let bookingsByStatus : [(Text, Nat)] = [
      ("pending", pendingCount),
      ("paid", paidCount),
      ("cancelled", cancelledCount),
    ];

    {
      stats;
      revenueByMonth = [];
      bookingsByStatus;
    };
  };
};
