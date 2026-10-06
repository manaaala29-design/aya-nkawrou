import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/fields";
import FieldsLib "../lib/fields";

mixin (
  accessControlState : AccessControl.AccessControlState,
  fields : Map.Map<Nat, Types.Field>,
) {
  public query ({ caller }) func listFields(filter : Types.FieldFilter) : async [Types.FieldView] {
    ignore caller;
    FieldsLib.listFields(fields, filter);
  };

  public query ({ caller }) func getField(id : Nat) : async ?Types.FieldView {
    ignore caller;
    FieldsLib.getField(fields, id);
  };

  public shared ({ caller }) func setFieldAvailability(id : Nat, available : Bool) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return false;
    };
    FieldsLib.setAvailability(fields, id, available);
  };
};
