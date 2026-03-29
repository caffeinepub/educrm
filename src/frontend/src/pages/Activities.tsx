import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  Loader2,
  Mail,
  Phone,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import {
  type Activity,
  ActivityStatus,
  ActivityType,
  useActivities,
  useContacts,
  useCreateActivity,
  useDeals,
  useDeleteActivity,
  useIsAdmin,
  useMarkActivityDone,
} from "../hooks/useQueries";

const activityTypeIcon: Record<ActivityType, React.ReactNode> = {
  [ActivityType.call]: <Phone className="w-4 h-4" />,
  [ActivityType.email]: <Mail className="w-4 h-4" />,
  [ActivityType.meeting]: <Video className="w-4 h-4" />,
  [ActivityType.task]: <CheckSquare className="w-4 h-4" />,
};

const activityTypeColors: Record<ActivityType, string> = {
  [ActivityType.call]: "bg-blue-100 text-blue-600",
  [ActivityType.email]: "bg-purple-100 text-purple-600",
  [ActivityType.meeting]: "bg-amber-100 text-amber-600",
  [ActivityType.task]: "bg-emerald-100 text-emerald-600",
};

type FormData = {
  title: string;
  activityType: ActivityType;
  description: string;
  contactId: string;
  dealId: string;
  dueDate: string;
};

const defaultForm: FormData = {
  title: "",
  activityType: ActivityType.call,
  description: "",
  contactId: "",
  dealId: "",
  dueDate: "",
};

export default function Activities() {
  const { t } = useLanguage();
  const { data: activities, isLoading } = useActivities();
  const { data: contacts } = useContacts();
  const { data: deals } = useDeals();
  const { data: isAdmin } = useIsAdmin();
  const createActivity = useCreateActivity();
  const markDone = useMarkActivityDone();
  const deleteActivity = useDeleteActivity();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | ActivityStatus>("all");

  const filtered = (activities ?? [])
    .filter((a) => (filter === "all" ? true : a.status === filter))
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  const [form, setForm] = useState<FormData>(defaultForm);

  const handleSubmit = async () => {
    if (!form.title || !form.dueDate) {
      toast.error("Title and due date are required");
      return;
    }
    try {
      await createActivity.mutateAsync({
        activityType: form.activityType,
        title: form.title,
        description: form.description,
        contactId: form.contactId ? BigInt(form.contactId) : null,
        dealId: form.dealId ? BigInt(form.dealId) : null,
        dueDate: form.dueDate,
      });
      toast.success(t("success"));
      setDialogOpen(false);
      setForm(defaultForm);
    } catch {
      toast.error(t("error"));
    }
  };

  const handleMarkDone = async (id: bigint) => {
    try {
      await markDone.mutateAsync(id);
      toast.success(t("success"));
    } catch {
      toast.error(t("error"));
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteActivity.mutateAsync(id);
      toast.success(t("success"));
    } catch {
      toast.error(t("error"));
    }
  };

  const getContactName = (id?: bigint) =>
    id ? (contacts?.find((c) => c.id === id)?.name ?? "") : "";

  return (
    <div className="p-6 space-y-5" data-ocid="activities.page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("activities_title")}</h1>
        <Button
          data-ocid="activities.add_activity.button"
          onClick={() => {
            setForm(defaultForm);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("add_activity")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2" data-ocid="activities.filter.tab">
        {(["all", ActivityStatus.pending, ActivityStatus.done] as const).map(
          (f) => (
            <Button
              key={f}
              data-ocid={`activities.filter.${f}.toggle`}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? t("all")
                : f === ActivityStatus.pending
                  ? t("status_pending")
                  : t("status_done")}
            </Button>
          ),
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="activities.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="activities.empty_state"
        >
          {t("no_activities_list")}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((act, idx) => (
            <div
              key={act.id.toString()}
              data-ocid={`activities.item.${idx + 1}`}
              className="bg-card rounded-xl border border-border shadow-xs p-4 flex items-start gap-4"
            >
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${activityTypeColors[act.activityType]}`}
              >
                {activityTypeIcon[act.activityType]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{act.title}</p>
                    {act.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {act.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      act.status === ActivityStatus.done
                        ? "secondary"
                        : "outline"
                    }
                    className="flex-shrink-0 text-xs"
                  >
                    {act.status === ActivityStatus.done
                      ? t("status_done")
                      : t("status_pending")}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {act.dueDate}
                  </span>
                  {act.contactId && (
                    <span>{getContactName(act.contactId)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {act.status === ActivityStatus.pending && (
                  <Button
                    data-ocid={`activities.mark_done.button.${idx + 1}`}
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => handleMarkDone(act.id)}
                    disabled={markDone.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    data-ocid={`activities.delete_button.${idx + 1}`}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(act.id)}
                    disabled={deleteActivity.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="activities.dialog">
          <DialogHeader>
            <DialogTitle>{t("add_activity")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-title">{t("activity_title")}</Label>
              <Input
                data-ocid="activities.title.input"
                id="a-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("activity_type")}</Label>
              <Select
                value={form.activityType}
                onValueChange={(v) =>
                  setForm({ ...form, activityType: v as ActivityType })
                }
              >
                <SelectTrigger data-ocid="activities.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ActivityType).map((t2) => (
                    <SelectItem key={t2} value={t2}>
                      {t(`type_${t2}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-desc">{t("activity_description")}</Label>
              <Textarea
                data-ocid="activities.description.textarea"
                id="a-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("activity_contact")}</Label>
                <Select
                  value={form.contactId}
                  onValueChange={(v) => setForm({ ...form, contactId: v })}
                >
                  <SelectTrigger data-ocid="activities.contact.select">
                    <SelectValue placeholder={t("none")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("none")}</SelectItem>
                    {(contacts ?? []).map((c) => (
                      <SelectItem key={c.id.toString()} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("activity_deal")}</Label>
                <Select
                  value={form.dealId}
                  onValueChange={(v) => setForm({ ...form, dealId: v })}
                >
                  <SelectTrigger data-ocid="activities.deal.select">
                    <SelectValue placeholder={t("none")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("none")}</SelectItem>
                    {(deals ?? []).map((d) => (
                      <SelectItem key={d.id.toString()} value={d.id.toString()}>
                        {d.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-date">{t("activity_due_date")}</Label>
              <Input
                data-ocid="activities.due_date.input"
                id="a-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="activities.cancel_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              data-ocid="activities.submit_button"
              onClick={handleSubmit}
              disabled={createActivity.isPending}
            >
              {createActivity.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
