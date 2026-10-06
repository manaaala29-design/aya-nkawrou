import Common "common";

module {
  public type BookingId = Common.BookingId;
  public type FieldId = Common.FieldId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type BookingStatus = {
    #pending;
    #paid;
    #cancelled;
  };

  public type Booking = {
    id : BookingId;
    userId : UserId;
    fieldId : FieldId;
    date : Text;
    time : Text;
    durationMinutes : Nat;
    playerCount : Nat;
    teamName : Text;
    priceDt : Float;
    status : BookingStatus;
    paymentReference : ?Text;
    createdAt : Timestamp;
  };

  public type BookingView = {
    id : BookingId;
    userId : UserId;
    fieldId : FieldId;
    date : Text;
    time : Text;
    durationMinutes : Nat;
    playerCount : Nat;
    teamName : Text;
    priceDt : Float;
    status : BookingStatus;
    paymentReference : ?Text;
    createdAt : Timestamp;
  };

  public type CreateBookingInput = {
    fieldId : FieldId;
    date : Text;
    time : Text;
    durationMinutes : Nat;
    playerCount : Nat;
    teamName : Text;
  };

  public type PaymentResult = {
    #ok : BookingView;
    #err : Text;
  };
};
