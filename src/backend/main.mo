import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import IntValue "mo:caffeineai-oql/IntValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import FloatValue "mo:caffeineai-oql/FloatValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";

import AccountTypes "types/accounts";
import FieldTypes "types/fields";
import BookingTypes "types/bookings";
import TeamTypes "types/teams";
import MatchTypes "types/matches";

import FieldsLib "lib/fields";

import AccountsApi "mixins/accounts-api";
import FieldsApi "mixins/fields-api";
import BookingsApi "mixins/bookings-api";
import TeamsApi "mixins/teams-api";
import MatchesApi "mixins/matches-api";
import AdminApi "mixins/admin-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let accounts : Map.Map<Principal, AccountTypes.Account>;
  let usernames : Map.Map<Text, Principal>;
  let emails : Map.Map<Text, Principal>;
  let stats : Map.Map<Principal, AccountTypes.PlayerStats>;
  let memberships : Map.Map<Principal, [Nat]>;
  let achievements : Map.Map<Principal, [Text]>;

  let fields : Map.Map<Nat, FieldTypes.Field>;

  let bookings : Map.Map<Nat, BookingTypes.Booking>;
  let bookingState : { var nextBookingId : Nat };

  let teams : Map.Map<Nat, TeamTypes.Team>;
  let teamState : { var nextTeamId : Nat };
  let availability : Map.Map<Principal, TeamTypes.AvailabilityInput>;

  let matches : Map.Map<Nat, MatchTypes.Match>;
  let matchState : { var nextMatchId : Nat };

  include MixinAuthorization(accessControlState, null);

  FieldsLib.seedFields(fields);

  include AccountsApi(accessControlState, accounts, usernames, emails, stats, memberships, achievements);
  include FieldsApi(accessControlState, fields);
  include BookingsApi(accessControlState, bookings, bookingState, fields);
  include TeamsApi(accessControlState, teams, teamState, memberships, availability, accounts);
  include MatchesApi(accessControlState, matches, matchState, teams, fields);
  include AdminApi(accessControlState, accounts, bookings, teams, matches);
  include ApiDocMixin();

  include Expose({
    entities = [
      fields.toEntityManual("field", "Field", "id")
        .sample({
          id = 0;
          name = "";
          location = "";
          distanceKm = 0.0;
          rating = 0.0;
          available = true;
          priceDt = 0.0;
          timeSlots = [];
          imageUrl = null;
        })
        .payload("id", func f = f.id, )
        .payload("name", func f = f.name, )
        .payload("location", func f = f.location, )
        .payload("distanceKm", func f = f.distanceKm, )
        .payload("rating", func f = f.rating, )
        .payload("available", func f = f.available, )
        .payload("priceDt", func f = f.priceDt, )
        .payload("timeSlots", func f = f.timeSlots.values().join(", "), )
        .payload("imageUrl", func f = switch (f.imageUrl) { case null ""; case (?u) u }, )
        .public_()
        .build(),
      teams.toEntityManual("team", "Team", "id")
        .sample({
          id = 0;
          name = "";
          logoUrl = null;
          color = "";
          captain = Principal.fromText("aaaaa-aa");
          description = "";
          level = #beginner;
          playerCount = 0;
          memberIds = [];
          createdAt = 0;
        })
        .payload("id", func t = t.id, )
        .payload("name", func t = t.name, )
        .payload("logoUrl", func t = switch (t.logoUrl) { case null ""; case (?u) u }, )
        .payload("color", func t = t.color, )
        .payload("captain", func t = t.captain, )
        .payload("description", func t = t.description, )
        .payload("level", func t = (switch (t.level) {
          case (#beginner) "beginner";
          case (#intermediate) "intermediate";
          case (#good) "good";
          case (#professional) "professional";
        }), )
        .payload("playerCount", func t = t.playerCount, )
        .payload("memberIds", func t = t.memberIds.values().map(func p = p.toText()).join(", "), )
        .payload("createdAt", func t = t.createdAt, )
        .public_()
        .build(),
      matches.toEntityManual("match", "Match", "id")
        .sample({
          id = 0;
          homeTeamId = 0;
          awayTeamId = 0;
          date = "";
          time = "";
          fieldId = 0;
          playerCount = 0;
          level = #beginner;
          pricePerPlayerDt = 0.0;
          status = #scheduled;
          invitedPlayerIds = [];
          createdAt = 0;
        })
        .payload("id", func m = m.id, )
        .payload("homeTeamId", func m = m.homeTeamId, )
        .payload("awayTeamId", func m = m.awayTeamId, )
        .payload("date", func m = m.date, )
        .payload("time", func m = m.time, )
        .payload("fieldId", func m = m.fieldId, )
        .payload("playerCount", func m = m.playerCount, )
        .payload("level", func m = (switch (m.level) {
          case (#beginner) "beginner";
          case (#intermediate) "intermediate";
          case (#good) "good";
          case (#professional) "professional";
        }), )
        .payload("pricePerPlayerDt", func m = m.pricePerPlayerDt, )
        .payload("status", func m = (switch (m.status) {
          case (#scheduled) "scheduled";
          case (#completed) "completed";
          case (#cancelled) "cancelled";
        }), )
        .payload("invitedPlayerIds", func m = m.invitedPlayerIds.values().map(func p = p.toText()).join(", "), )
        .payload("createdAt", func m = m.createdAt, )
        .public_()
        .build(),
      bookings.toEntityManual("booking", "Booking", "id")
        .sample({
          id = 0;
          userId = Principal.fromText("aaaaa-aa");
          fieldId = 0;
          date = "";
          time = "";
          durationMinutes = 0;
          playerCount = 0;
          teamName = "";
          priceDt = 0.0;
          status = #pending;
          paymentReference = null;
          createdAt = 0;
        })
        .payload("id", func b = b.id, )
        .payload("userId", func b = b.userId, )
        .payload("fieldId", func b = b.fieldId, )
        .payload("date", func b = b.date, )
        .payload("time", func b = b.time, )
        .payload("durationMinutes", func b = b.durationMinutes, )
        .payload("playerCount", func b = b.playerCount, )
        .payload("teamName", func b = b.teamName, )
        .payload("priceDt", func b = b.priceDt, )
        .payload("status", func b = (switch (b.status) {
          case (#pending) "pending";
          case (#paid) "paid";
          case (#cancelled) "cancelled";
        }), )
        .payload("paymentReference", func b = (switch (b.paymentReference) { case null ""; case (?r) r }), )
        .payload("createdAt", func b = b.createdAt, )
        .controllerOnly()
        .build(),
    ];
  });
};
