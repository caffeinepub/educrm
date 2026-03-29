import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Note {
    id: bigint;
    content: string;
    createdAt: bigint;
    dealId?: bigint;
    contactId?: bigint;
}
export interface Activity {
    id: bigint;
    status: ActivityStatus;
    title: string;
    activityType: ActivityType;
    createdAt: bigint;
    dueDate: string;
    description: string;
    dealId?: bigint;
    contactId?: bigint;
}
export interface Contact {
    id: bigint;
    status: ContactStatus;
    name: string;
    createdAt: bigint;
    email: string;
    company: string;
    phone: string;
}
export interface Deal {
    id: bigint;
    title: string;
    value: number;
    createdAt: bigint;
    expectedCloseDate: string;
    stage: DealStage;
    contactId: bigint;
}
export interface Stats {
    contactsByStatus: Array<[ContactStatus, bigint]>;
    dealsByStage: Array<[DealStage, bigint]>;
    totalPipelineValue: number;
    pendingActivitiesCount: bigint;
}
export interface UserProfile {
    name: string;
}
export enum ActivityStatus {
    pending = "pending",
    done = "done"
}
export enum ActivityType {
    call = "call",
    task = "task",
    email = "email",
    meeting = "meeting"
}
export enum ContactStatus {
    customer = "customer",
    lead = "lead",
    inactive = "inactive",
    prospect = "prospect"
}
export enum DealStage {
    closedWon = "closedWon",
    proposal = "proposal",
    negotiation = "negotiation",
    qualified = "qualified",
    newLead = "newLead",
    closedLost = "closedLost"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createActivity(activityType: ActivityType, title: string, description: string, contactId: bigint | null, dealId: bigint | null, dueDate: string): Promise<bigint>;
    createContact(name: string, email: string, phone: string, company: string, status: ContactStatus): Promise<bigint>;
    createDeal(title: string, contactId: bigint, value: number, stage: DealStage, expectedCloseDate: string): Promise<bigint>;
    createNote(content: string, contactId: bigint | null, dealId: bigint | null): Promise<bigint>;
    deleteActivity(id: bigint): Promise<void>;
    deleteContact(id: bigint): Promise<void>;
    deleteDeal(id: bigint): Promise<void>;
    deleteNote(id: bigint): Promise<void>;
    getActivity(id: bigint): Promise<Activity>;
    getAllActivities(): Promise<Array<Activity>>;
    getAllContacts(): Promise<Array<Contact>>;
    getAllDeals(): Promise<Array<Deal>>;
    getAllNotes(): Promise<Array<Note>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContact(id: bigint): Promise<Contact>;
    getDeal(id: bigint): Promise<Deal>;
    getNote(id: bigint): Promise<Note>;
    getStats(): Promise<Stats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markActivityDone(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateActivity(id: bigint, activityType: ActivityType, title: string, description: string, contactId: bigint | null, dealId: bigint | null, dueDate: string, status: ActivityStatus): Promise<void>;
    updateContact(id: bigint, name: string, email: string, phone: string, company: string, status: ContactStatus): Promise<void>;
    updateDeal(id: bigint, title: string, contactId: bigint, value: number, stage: DealStage, expectedCloseDate: string): Promise<void>;
    updateDealStage(id: bigint, stage: DealStage): Promise<void>;
    updateNote(id: bigint, content: string, contactId: bigint | null, dealId: bigint | null): Promise<void>;
}
