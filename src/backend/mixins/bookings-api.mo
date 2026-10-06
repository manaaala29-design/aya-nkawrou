import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/bookings";
import FieldTypes "../types/fields";
import BookingsLib "../lib/bookings";

mixin (
  accessControlState : AccessControl.AccessControlState,
  bookings : Map.Map<Nat, Types.Booking>,
  bookingState : { var nextBookingId : Nat },
  fields : Map.Map<Nat, FieldTypes.Field>,
) {
  public shared ({ caller }) func createBooking(input : Types.CreateBookingInput) : async Types.BookingView {
    let priceDt = switch (fields.get(input.fieldId)) {
      case null 5.6;
      case (?field) field.priceDt;
    };
    BookingsLib.createBooking(bookings, bookingState, caller, input, priceDt);
  };

  public shared ({ caller }) func confirmBookingPayment(bookingId : Nat, paymentReference : Text) : async Types.PaymentResult {
    BookingsLib.confirmPayment(bookings, caller, bookingId, paymentReference);
  };

  public query ({ caller }) func listMyBookings() : async [Types.BookingView] {
    BookingsLib.listUserBookings(bookings, caller);
  };

  public query ({ caller }) func getBooking(bookingId : Nat) : async ?Types.BookingView {
    BookingsLib.getBooking(bookings, caller, bookingId);
  };

  public query ({ caller }) func listAllBookings() : async [Types.BookingView] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return [];
    };
    BookingsLib.listAllBookings(bookings);
  };

  public shared ({ caller }) func cancelBooking(bookingId : Nat) : async Bool {
    BookingsLib.cancelBooking(bookings, caller, bookingId);
  };
};
