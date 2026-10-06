import Map "mo:core/Map";
import Types "../types/fields";

module {
  // The seven Mahdia fields, seeded once on first use.
  let seedData : [Types.Field] = [
    {
      id = 1;
      name = "ISET Mahdia";
      location = "ISET Mahdia, Mahdia";
      distanceKm = 1.2;
      rating = 4.3;
      available = true;
      priceDt = 5.6;
      timeSlots = ["17:00", "18:30", "20:00", "21:30"];
      imageUrl = null;
    },
    {
      id = 2;
      name = "ISIMA";
      location = "ISIMA, Mahdia";
      distanceKm = 2.0;
      rating = 4.1;
      available = true;
      priceDt = 5.6;
      timeSlots = ["16:00", "17:30", "19:00", "20:30"];
      imageUrl = null;
    },
    {
      id = 3;
      name = "Stade Hiboun";
      location = "Hiboun, Mahdia";
      distanceKm = 3.5;
      rating = 4.5;
      available = true;
      priceDt = 5.6;
      timeSlots = ["15:00", "17:00", "19:00", "21:00"];
      imageUrl = null;
    },
    {
      id = 4;
      name = "Stade Mahdia";
      location = "Centre-ville, Mahdia";
      distanceKm = 0.8;
      rating = 4.6;
      available = true;
      priceDt = 5.6;
      timeSlots = ["16:30", "18:00", "19:30", "21:00"];
      imageUrl = null;
    },
    {
      id = 5;
      name = "Stade Olympique de Mahdia";
      location = "Route de Sfax, Mahdia";
      distanceKm = 2.7;
      rating = 4.8;
      available = true;
      priceDt = 5.6;
      timeSlots = ["14:00", "16:00", "18:00", "20:00"];
      imageUrl = null;
    },
    {
      id = 6;
      name = "Stade Rejich";
      location = "Rejich, Mahdia";
      distanceKm = 5.4;
      rating = 4.0;
      available = true;
      priceDt = 5.6;
      timeSlots = ["15:30", "17:30", "19:30"];
      imageUrl = null;
    },
    {
      id = 7;
      name = "Stade Makarem Mahdia";
      location = "Makarem, Mahdia";
      distanceKm = 4.1;
      rating = 4.2;
      available = true;
      priceDt = 5.6;
      timeSlots = ["16:00", "18:00", "20:00", "21:30"];
      imageUrl = null;
    },
  ];

  public func seedFields(fields : Map.Map<Nat, Types.Field>) {
    if (fields.size() == 0) {
      for (field in seedData.values()) {
        fields.add(field.id, field);
      };
    };
  };

  public func toView(field : Types.Field) : Types.FieldView {
    {
      id = field.id;
      name = field.name;
      location = field.location;
      distanceKm = field.distanceKm;
      rating = field.rating;
      available = field.available;
      priceDt = field.priceDt;
      timeSlots = field.timeSlots;
      imageUrl = field.imageUrl;
    };
  };

  public func listFields(
    fields : Map.Map<Nat, Types.Field>,
    filter : Types.FieldFilter,
  ) : [Types.FieldView] {
    let matched = fields.values().filter(func field = matchesFilter(field, filter));
    matched.map(func field = toView(field)).toArray();
  };

  func matchesFilter(field : Types.Field, filter : Types.FieldFilter) : Bool {
    let priceOk = switch (filter.maxPrice) {
      case null true;
      case (?maxPrice) field.priceDt <= maxPrice;
    };
    let distanceOk = switch (filter.maxDistanceKm) {
      case null true;
      case (?maxDistance) field.distanceKm <= maxDistance;
    };
    let ratingOk = switch (filter.minRating) {
      case null true;
      case (?minRating) field.rating >= minRating;
    };
    let timeOk = switch (filter.timeSlot) {
      case null true;
      case (?slot) field.timeSlots.any(func s = s == slot);
    };
    priceOk and distanceOk and ratingOk and timeOk;
  };

  public func getField(
    fields : Map.Map<Nat, Types.Field>,
    id : Nat,
  ) : ?Types.FieldView {
    switch (fields.get(id)) {
      case null null;
      case (?field) ?toView(field);
    };
  };

  public func setAvailability(
    fields : Map.Map<Nat, Types.Field>,
    id : Nat,
    available : Bool,
  ) : Bool {
    switch (fields.get(id)) {
      case null false;
      case (?field) {
        fields.add(id, { field with available });
        true;
      };
    };
  };
};
