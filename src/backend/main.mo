import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Data types
  type Contact = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    company : Text;
    status : ContactStatus;
    createdAt : Int;
  };

  type Deal = {
    id : Nat;
    title : Text;
    contactId : Nat;
    value : Float;
    stage : DealStage;
    expectedCloseDate : Text;
    createdAt : Int;
  };

  type Activity = {
    id : Nat;
    activityType : ActivityType;
    title : Text;
    description : Text;
    contactId : ?Nat;
    dealId : ?Nat;
    dueDate : Text;
    status : ActivityStatus;
    createdAt : Int;
  };

  type Note = {
    id : Nat;
    content : Text;
    contactId : ?Nat;
    dealId : ?Nat;
    createdAt : Int;
  };

  type ContactStatus = {
    #lead;
    #customer;
    #prospect;
    #inactive;
  };

  type DealStage = {
    #newLead;
    #qualified;
    #proposal;
    #negotiation;
    #closedWon;
    #closedLost;
  };

  type ActivityType = {
    #call;
    #meeting;
    #email;
    #task;
  };

  type ActivityStatus = {
    #pending;
    #done;
  };

  public type UserProfile = {
    name : Text;
  };

  type Stats = {
    contactsByStatus : [(ContactStatus, Nat)];
    dealsByStage : [(DealStage, Nat)];
    totalPipelineValue : Float;
    pendingActivitiesCount : Nat;
  };

  module Contact {
    public func compare(contact1 : Contact, contact2 : Contact) : Order.Order {
      Nat.compare(contact1.id, contact2.id);
    };

    public func compareByEmail(contact1 : Contact, contact2 : Contact) : Order.Order {
      Text.compare(contact1.email, contact2.email);
    };

    public func compareByCreatedAt(contact1 : Contact, contact2 : Contact) : Order.Order {
      Int.compare(contact1.createdAt, contact2.createdAt);
    };
  };

  module Deal {
    public func compare(deal1 : Deal, deal2 : Deal) : Order.Order {
      Nat.compare(deal1.id, deal2.id);
    };

    public func compareByValue(deal1 : Deal, deal2 : Deal) : Order.Order {
      Float.compare(deal1.value, deal2.value);
    };

    public func compareByCreatedAt(deal1 : Deal, deal2 : Deal) : Order.Order {
      Int.compare(deal1.createdAt, deal2.createdAt);
    };
  };

  module Activity {
    public func compare(activity1 : Activity, activity2 : Activity) : Order.Order {
      Nat.compare(activity1.id, activity2.id);
    };

    public func compareByCreatedAt(activity1 : Activity, activity2 : Activity) : Order.Order {
      Int.compare(activity1.createdAt, activity2.createdAt);
    };
  };

  module Note {
    public func compare(note1 : Note, note2 : Note) : Order.Order {
      Nat.compare(note1.id, note2.id);
    };

    public func compareByCreatedAt(note1 : Note, note2 : Note) : Order.Order {
      Int.compare(note1.createdAt, note2.createdAt);
    };
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let contacts = Map.empty<Nat, Contact>();
  let deals = Map.empty<Nat, Deal>();
  let activities = Map.empty<Nat, Activity>();
  let notes = Map.empty<Nat, Note>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextContactId = 1;
  var nextDealId = 1;
  var nextActivityId = 1;
  var nextNoteId = 1;

  // User profile operations

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Contact operations

  public shared ({ caller }) func createContact(name : Text, email : Text, phone : Text, company : Text, status : ContactStatus) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can create contacts");
    };
    let id = nextContactId;
    let contact : Contact = {
      id;
      name;
      email;
      phone;
      company;
      status;
      createdAt = Time.now();
    };
    contacts.add(id, contact);
    nextContactId += 1;
    id;
  };

  public query ({ caller }) func getContact(id : Nat) : async Contact {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can view contacts");
    };
    switch (contacts.get(id)) {
      case (null) { Runtime.trap("Contact not found") };
      case (?contact) { contact };
    };
  };

  public query ({ caller }) func getAllContacts() : async [Contact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can view contacts");
    };
    contacts.values().toArray().sort(Contact.compareByCreatedAt);
  };

  public shared ({ caller }) func updateContact(id : Nat, name : Text, email : Text, phone : Text, company : Text, status : ContactStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can update contacts");
    };

    switch (contacts.get(id)) {
      case (null) { Runtime.trap("Contact not found") };
      case (?contact) {
        let updatedContact = {
          contact with
          name;
          email;
          phone;
          company;
          status;
        };
        contacts.add(id, updatedContact);
      };
    };
  };

  public shared ({ caller }) func deleteContact(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete contacts");
    };
    if (not contacts.containsKey(id)) { Runtime.trap("Contact not found") };
    contacts.remove(id);
  };

  // Deal operations

  public shared ({ caller }) func createDeal(title : Text, contactId : Nat, value : Float, stage : DealStage, expectedCloseDate : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can create deals");
    };
    let id = nextDealId;
    let deal : Deal = {
      id;
      title;
      contactId;
      value;
      stage;
      expectedCloseDate;
      createdAt = Time.now();
    };
    deals.add(id, deal);
    nextDealId += 1;
    id;
  };

  public query ({ caller }) func getDeal(id : Nat) : async Deal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can view deals");
    };
    switch (deals.get(id)) {
      case (null) { Runtime.trap("Deal not found") };
      case (?deal) { deal };
    };
  };

  public query ({ caller }) func getAllDeals() : async [Deal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can view deals");
    };
    deals.values().toArray().sort(Deal.compareByCreatedAt);
  };

  public shared ({ caller }) func updateDeal(id : Nat, title : Text, contactId : Nat, value : Float, stage : DealStage, expectedCloseDate : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can update deals");
    };
    switch (deals.get(id)) {
      case (null) { Runtime.trap("Deal not found") };
      case (?deal) {
        let updatedDeal = {
          deal with
          title;
          contactId;
          value;
          stage;
          expectedCloseDate;
        };
        deals.add(id, updatedDeal);
      };
    };
  };

  public shared ({ caller }) func updateDealStage(id : Nat, stage : DealStage) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can update deals");
    };
    switch (deals.get(id)) {
      case (null) { Runtime.trap("Deal not found") };
      case (?deal) {
        let updatedDeal = {
          deal with
          stage;
        };
        deals.add(id, updatedDeal);
      };
    };
  };

  public shared ({ caller }) func deleteDeal(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete deals");
    };
    if (not deals.containsKey(id)) { Runtime.trap("Deal not found") };
    deals.remove(id);
  };

  // Activity operations

  public shared ({ caller }) func createActivity(activityType : ActivityType, title : Text, description : Text, contactId : ?Nat, dealId : ?Nat, dueDate : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can create activities");
    };
    let id = nextActivityId;
    let activity : Activity = {
      id;
      activityType;
      title;
      description;
      contactId;
      dealId;
      dueDate;
      status = #pending;
      createdAt = Time.now();
    };
    activities.add(id, activity);
    nextActivityId += 1;
    id;
  };

  public query ({ caller }) func getActivity(id : Nat) : async Activity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can view activities");
    };
    switch (activities.get(id)) {
      case (null) { Runtime.trap("Activity not found") };
      case (?activity) { activity };
    };
  };

  public query ({ caller }) func getAllActivities() : async [Activity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can view activities");
    };
    activities.values().toArray().sort(Activity.compareByCreatedAt);
  };

  public shared ({ caller }) func updateActivity(id : Nat, activityType : ActivityType, title : Text, description : Text, contactId : ?Nat, dealId : ?Nat, dueDate : Text, status : ActivityStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can update activities");
    };
    switch (activities.get(id)) {
      case (null) { Runtime.trap("Activity not found") };
      case (?activity) {
        let updatedActivity = {
          activity with
          activityType;
          title;
          description;
          contactId;
          dealId;
          dueDate;
          status;
        };
        activities.add(id, updatedActivity);
      };
    };
  };

  public shared ({ caller }) func markActivityDone(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can update activities");
    };
    switch (activities.get(id)) {
      case (null) { Runtime.trap("Activity not found") };
      case (?activity) {
        let updatedActivity = {
          activity with
          status = #done;
        };
        activities.add(id, updatedActivity);
      };
    };
  };

  public shared ({ caller }) func deleteActivity(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete activities");
    };
    if (not activities.containsKey(id)) { Runtime.trap("Activity not found") };
    activities.remove(id);
  };

  // Note operations

  public shared ({ caller }) func createNote(content : Text, contactId : ?Nat, dealId : ?Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can create notes");
    };
    let id = nextNoteId;
    let note : Note = {
      id;
      content;
      contactId;
      dealId;
      createdAt = Time.now();
    };
    notes.add(id, note);
    nextNoteId += 1;
    id;
  };

  public query ({ caller }) func getNote(id : Nat) : async Note {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can view notes");
    };
    switch (notes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) { note };
    };
  };

  public query ({ caller }) func getAllNotes() : async [Note] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can view notes");
    };
    notes.values().toArray().sort(Note.compareByCreatedAt);
  };

  public shared ({ caller }) func updateNote(id : Nat, content : Text, contactId : ?Nat, dealId : ?Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can update notes");
    };
    switch (notes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) {
        let updatedNote = {
          note with
          content;
          contactId;
          dealId;
        };
        notes.add(id, updatedNote);
      };
    };
  };

  public shared ({ caller }) func deleteNote(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete notes");
    };
    if (not notes.containsKey(id)) { Runtime.trap("Note not found") };
    notes.remove(id);
  };

  // Stats operation

  public query ({ caller }) func getStats() : async Stats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only agents or admins can view stats");
    };

    // Count contacts by status
    var leadCount = 0;
    var customerCount = 0;
    var prospectCount = 0;
    var inactiveCount = 0;

    for (contact in contacts.values()) {
      switch (contact.status) {
        case (#lead) { leadCount += 1 };
        case (#customer) { customerCount += 1 };
        case (#prospect) { prospectCount += 1 };
        case (#inactive) { inactiveCount += 1 };
      };
    };

    // Count deals by stage and calculate total pipeline value
    var newLeadCount = 0;
    var qualifiedCount = 0;
    var proposalCount = 0;
    var negotiationCount = 0;
    var closedWonCount = 0;
    var closedLostCount = 0;
    var totalPipelineValue : Float = 0.0;

    for (deal in deals.values()) {
      totalPipelineValue += deal.value;
      switch (deal.stage) {
        case (#newLead) { newLeadCount += 1 };
        case (#qualified) { qualifiedCount += 1 };
        case (#proposal) { proposalCount += 1 };
        case (#negotiation) { negotiationCount += 1 };
        case (#closedWon) { closedWonCount += 1 };
        case (#closedLost) { closedLostCount += 1 };
      };
    };

    // Count pending activities
    var pendingActivitiesCount = 0;
    for (activity in activities.values()) {
      switch (activity.status) {
        case (#pending) { pendingActivitiesCount += 1 };
        case (#done) {};
      };
    };

    {
      contactsByStatus = [
        (#lead, leadCount),
        (#customer, customerCount),
        (#prospect, prospectCount),
        (#inactive, inactiveCount),
      ];
      dealsByStage = [
        (#newLead, newLeadCount),
        (#qualified, qualifiedCount),
        (#proposal, proposalCount),
        (#negotiation, negotiationCount),
        (#closedWon, closedWonCount),
        (#closedLost, closedLostCount),
      ];
      totalPipelineValue;
      pendingActivitiesCount;
    };
  };
};
