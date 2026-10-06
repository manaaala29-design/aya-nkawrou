import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/bookings";

module {
  public func toView(booking : Types.Booking) : Types.BookingView {
    {
      id = booking.id;
      userId = booking.userId;
      fieldId = booking.fieldId;
      date = booking.date;
      time = booking.time;
      durationMinutes = booking.durationMinutes;
      playerCount = booking.playerCount;
      teamName = booking.teamName;
      priceDt = booking.priceDt;
      status = booking.status;
      paymentReference = booking.paymentReference;
      createdAt = booking.createdAt;
    };
  };

  public func createBooking(
    bookings : Map.Map<Nat, Types.Booking>,
    state : { var nextBookingId : Nat },
    caller : Principal,
    input : Types.CreateBookingInput,
    priceDt : Float,
  ) : Types.BookingView {
    let id = state.nextBookingId;
    state.nextBookingId := id + 1;
    let booking : Types.Booking = {
      id;
      userId = caller;
      fieldId = input.fieldId;
      date = input.date;
      time = input.time;
      durationMinutes = input.durationMinutes;
      playerCount = input.playerCount;
      teamName = input.teamName;
      priceDt;
      status = #pending;
      paymentReference = null;
      createdAt = Time.now();
    };
    bookings.add(id, booking);
    toView(booking);
  };

  public func confirmPayment(
    bookings : Map.Map<Nat, Types.Booking>,
    caller : Principal,
    bookingId : Nat,
    paymentReference : Text,
  ) : Types.PaymentResult {
    switch (bookings.get(bookingId)) {
      case null #err("Réservation introuvable");
      case (?booking) {
        if (booking.userId != caller) {
          return #err("Non autorisé");
        };
        if (booking.status == #cancelled) {
          return #err("Réservation annulée");
        };
        let updated : Types.Booking = {
          booking with
          status = #paid;
          paymentReference = ?paymentReference;
        };
        bookings.add(bookingId, updated);
        #ok(toView(updated));
      };
    };
  };

  public func listUserBookings(
    bookings : Map.Map<Nat, Types.Booking>,
    caller : Principal,
  ) : [Types.BookingView] {
    let matched = bookings.values().filter(func booking = booking.userId == caller);
    matched.map(func booking = toView(booking)).toArray();
  };

  public func getBooking(
    bookings : Map.Map<Nat, Types.Booking>,
    caller : Principal,
    bookingId : Nat,
  ) : ?Types.BookingView {
    switch (bookings.get(bookingId)) {
      case null null;
      case (?booking) {
        if (booking.userId == caller) {
          ?toView(booking);
        } else {
          null;
        };
      };
    };
  };

  public func listAllBookings(
    bookings : Map.Map<Nat, Types.Booking>,
  ) : [Types.BookingView] {
    bookings.values().map(func booking = toView(booking)).toArray();
  };

  public func cancelBooking(
    bookings : Map.Map<Nat, Types.Booking>,
    caller : Principal,
    bookingId : Nat,
  ) : Bool {
    switch (bookings.get(bookingId)) {
      case null false;
      case (?booking) {
        if (booking.userId != caller) {
          return false;
        };
        if (booking.status == #cancelled) {
          return false;
        };
        bookings.add(bookingId, { booking with status = #cancelled });
        true;
      };
    };
  };
};
