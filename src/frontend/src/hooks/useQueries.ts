import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Activity,
  ActivityStatus,
  ActivityType,
  type Contact,
  ContactStatus,
  type Deal,
  DealStage,
  type Stats,
  type UserProfile,
  UserRole,
} from "../backend";
import { useActor } from "./useActor";

export type { Contact, Deal, Activity, Stats, UserProfile };
export { ContactStatus, DealStage, ActivityType, ActivityStatus, UserRole };

export function useContacts() {
  const { actor, isFetching } = useActor();
  return useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeals() {
  const { actor, isFetching } = useActor();
  return useQuery<Deal[]>({
    queryKey: ["deals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDeals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActivities() {
  const { actor, isFetching } = useActor();
  return useQuery<Activity[]>({
    queryKey: ["activities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActivities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor)
        return {
          contactsByStatus: [],
          dealsByStage: [],
          totalPipelineValue: 0,
          pendingActivitiesCount: BigInt(0),
        };
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

// Mutations
export function useCreateContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phone: string;
      company: string;
      status: ContactStatus;
    }) =>
      actor!.createContact(
        data.name,
        data.email,
        data.phone,
        data.company,
        data.status,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useUpdateContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: bigint;
      name: string;
      email: string;
      phone: string;
      company: string;
      status: ContactStatus;
    }) =>
      actor!.updateContact(
        data.id,
        data.name,
        data.email,
        data.phone,
        data.company,
        data.status,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useDeleteContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteContact(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useCreateDeal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      contactId: bigint;
      value: number;
      stage: DealStage;
      expectedCloseDate: string;
    }) =>
      actor!.createDeal(
        data.title,
        data.contactId,
        data.value,
        data.stage,
        data.expectedCloseDate,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals"] }),
  });
}

export function useUpdateDeal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: bigint;
      title: string;
      contactId: bigint;
      value: number;
      stage: DealStage;
      expectedCloseDate: string;
    }) =>
      actor!.updateDeal(
        data.id,
        data.title,
        data.contactId,
        data.value,
        data.stage,
        data.expectedCloseDate,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals"] }),
  });
}

export function useUpdateDealStage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: bigint; stage: DealStage }) =>
      actor!.updateDealStage(data.id, data.stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals"] }),
  });
}

export function useDeleteDeal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteDeal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals"] }),
  });
}

export function useCreateActivity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      activityType: ActivityType;
      title: string;
      description: string;
      contactId: bigint | null;
      dealId: bigint | null;
      dueDate: string;
    }) =>
      actor!.createActivity(
        data.activityType,
        data.title,
        data.description,
        data.contactId,
        data.dealId,
        data.dueDate,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities"] }),
  });
}

export function useMarkActivityDone() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.markActivityDone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities"] }),
  });
}

export function useDeleteActivity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteActivity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities"] }),
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: UserProfile) => actor!.saveCallerUserProfile(profile),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}
