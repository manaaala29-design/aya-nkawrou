import Common "common";

module {
  public type FieldId = Common.FieldId;

  public type Field = {
    id : FieldId;
    name : Text;
    location : Text;
    distanceKm : Float;
    rating : Float;
    available : Bool;
    priceDt : Float;
    timeSlots : [Text];
    imageUrl : ?Text;
  };

  public type FieldView = {
    id : FieldId;
    name : Text;
    location : Text;
    distanceKm : Float;
    rating : Float;
    available : Bool;
    priceDt : Float;
    timeSlots : [Text];
    imageUrl : ?Text;
  };

  public type FieldFilter = {
    maxPrice : ?Float;
    maxDistanceKm : ?Float;
    timeSlot : ?Text;
    minRating : ?Float;
  };
};
