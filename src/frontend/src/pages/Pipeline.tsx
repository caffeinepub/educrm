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
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import {
  type Deal,
  DealStage,
  useContacts,
  useCreateDeal,
  useDeals,
  useDeleteDeal,
  useIsAdmin,
  useUpdateDeal,
  useUpdateDealStage,
} from "../hooks/useQueries";

const STAGES = [
  DealStage.newLead,
  DealStage.qualified,
  DealStage.proposal,
  DealStage.negotiation,
  DealStage.closedWon,
  DealStage.closedLost,
];

const stageColors: Record<DealStage, string> = {
  [DealStage.newLead]: "border-t-blue-400",
  [DealStage.qualified]: "border-t-indigo-400",
  [DealStage.proposal]: "border-t-amber-400",
  [DealStage.negotiation]: "border-t-orange-400",
  [DealStage.closedWon]: "border-t-emerald-500",
  [DealStage.closedLost]: "border-t-red-400",
};

const stageHeaderColors: Record<DealStage, string> = {
  [DealStage.newLead]: "text-blue-600",
  [DealStage.qualified]: "text-indigo-600",
  [DealStage.proposal]: "text-amber-600",
  [DealStage.negotiation]: "text-orange-600",
  [DealStage.closedWon]: "text-emerald-600",
  [DealStage.closedLost]: "text-red-600",
};

type FormData = {
  title: string;
  contactId: string;
  value: string;
  stage: DealStage;
  expectedCloseDate: string;
};

const defaultForm: FormData = {
  title: "",
  contactId: "",
  value: "",
  stage: DealStage.newLead,
  expectedCloseDate: "",
};

export default function Pipeline() {
  const { t } = useLanguage();
  const { data: deals, isLoading } = useDeals();
  const { data: contacts } = useContacts();
  const { data: isAdmin } = useIsAdmin();
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const updateStage = useUpdateDealStage();
  const deleteDeal = useDeleteDeal();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [draggingId, setDraggingId] = useState<bigint | null>(null);

  const openCreate = () => {
    setEditingDeal(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (d: Deal) => {
    setEditingDeal(d);
    setForm({
      title: d.title,
      contactId: d.contactId.toString(),
      value: d.value.toString(),
      stage: d.stage,
      expectedCloseDate: d.expectedCloseDate,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.contactId || !form.value) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (editingDeal) {
        await updateDeal.mutateAsync({
          id: editingDeal.id,
          title: form.title,
          contactId: BigInt(form.contactId),
          value: Number.parseFloat(form.value),
          stage: form.stage,
          expectedCloseDate: form.expectedCloseDate,
        });
      } else {
        await createDeal.mutateAsync({
          title: form.title,
          contactId: BigInt(form.contactId),
          value: Number.parseFloat(form.value),
          stage: form.stage,
          expectedCloseDate: form.expectedCloseDate,
        });
      }
      toast.success(t("success"));
      setDialogOpen(false);
    } catch {
      toast.error(t("error"));
    }
  };

  const handleDrop = async (stage: DealStage, e: React.DragEvent) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData("dealId");
    if (!idStr) return;
    const id = BigInt(idStr);
    const deal = deals?.find((d) => d.id === id);
    if (!deal || deal.stage === stage) return;
    try {
      await updateStage.mutateAsync({ id, stage });
      toast.success(t("success"));
    } catch {
      toast.error(t("error"));
    }
  };

  const getContactName = (contactId: bigint) =>
    contacts?.find((c) => c.id === contactId)?.name ?? "—";

  const isPending = createDeal.isPending || updateDeal.isPending;

  return (
    <div className="p-6 space-y-5" data-ocid="pipeline.page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("pipeline_title")}</h1>
        <Button data-ocid="pipeline.add_deal.button" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          {t("add_deal")}
        </Button>
      </div>

      {isLoading ? (
        <div
          className="flex gap-4 overflow-x-auto pb-4"
          data-ocid="pipeline.loading_state"
        >
          {STAGES.map((s) => (
            <Skeleton key={s} className="w-52 h-80 flex-shrink-0 rounded-xl" />
          ))}
        </div>
      ) : (
        <div
          className="flex gap-3 overflow-x-auto pb-4"
          data-ocid="pipeline.board"
        >
          {STAGES.map((stage) => {
            const stageDeals = (deals ?? []).filter((d) => d.stage === stage);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            return (
              <div
                key={stage}
                data-ocid={`pipeline.${stage}.panel`}
                className={`flex-shrink-0 w-56 bg-muted/30 rounded-xl border-t-2 ${stageColors[stage]} border border-border`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(stage, e)}
              >
                <div className="px-3 py-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide ${stageHeaderColors[stage]}`}
                    >
                      {t(`stage_${stage}`)}
                    </span>
                    <span className="text-xs bg-card border border-border rounded-full px-2 py-0.5 font-medium">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    €{stageValue.toLocaleString("el-GR")}
                  </p>
                </div>
                <div className="p-2 space-y-2 min-h-32">
                  {stageDeals.length === 0 && (
                    <p
                      className="text-xs text-muted-foreground text-center py-4"
                      data-ocid={`pipeline.${stage}.empty_state`}
                    >
                      {t("no_deals")}
                    </p>
                  )}
                  {stageDeals.map((deal, idx) => (
                    <div
                      key={deal.id.toString()}
                      data-ocid={`pipeline.deal.item.${idx + 1}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("dealId", deal.id.toString());
                        setDraggingId(deal.id);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      className={`bg-card rounded-lg border border-border p-3 shadow-xs cursor-grab active:cursor-grabbing hover:shadow-card transition-all ${
                        draggingId === deal.id ? "opacity-50" : ""
                      }`}
                    >
                      <p className="text-sm font-medium leading-tight truncate">
                        {deal.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {getContactName(deal.contactId)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-semibold text-foreground">
                          €{deal.value.toLocaleString("el-GR")}
                        </span>
                        <div className="flex gap-0.5">
                          <button
                            type="button"
                            data-ocid={`pipeline.deal.edit_button.${idx + 1}`}
                            onClick={() => openEdit(deal)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              data-ocid={`pipeline.deal.delete_button.${idx + 1}`}
                              onClick={() => setDeleteId(deal.id)}
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {deal.expectedCloseDate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="pipeline.deal.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingDeal ? t("edit_deal") : t("add_deal")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="d-title">{t("deal_title")}</Label>
              <Input
                data-ocid="pipeline.deal.title.input"
                id="d-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("deal_contact")}</Label>
              <Select
                value={form.contactId}
                onValueChange={(v) => setForm({ ...form, contactId: v })}
              >
                <SelectTrigger data-ocid="pipeline.deal.contact.select">
                  <SelectValue placeholder={t("deal_contact")} />
                </SelectTrigger>
                <SelectContent>
                  {(contacts ?? []).map((c) => (
                    <SelectItem key={c.id.toString()} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-value">{t("deal_value")}</Label>
              <Input
                data-ocid="pipeline.deal.value.input"
                id="d-value"
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("deal_stage")}</Label>
              <Select
                value={form.stage}
                onValueChange={(v) =>
                  setForm({ ...form, stage: v as DealStage })
                }
              >
                <SelectTrigger data-ocid="pipeline.deal.stage.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`stage_${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-date">{t("deal_close_date")}</Label>
              <Input
                data-ocid="pipeline.deal.date.input"
                id="d-date"
                type="date"
                value={form.expectedCloseDate}
                onChange={(e) =>
                  setForm({ ...form, expectedCloseDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="pipeline.deal.cancel_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              data-ocid="pipeline.deal.submit_button"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent data-ocid="pipeline.delete.dialog">
          <DialogHeader>
            <DialogTitle>{t("delete")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("confirm_delete")}</p>
          <DialogFooter>
            <Button
              data-ocid="pipeline.delete.cancel_button"
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              {t("cancel")}
            </Button>
            <Button
              data-ocid="pipeline.delete.confirm_button"
              variant="destructive"
              onClick={() =>
                deleteId &&
                deleteDeal
                  .mutateAsync(deleteId)
                  .then(() => {
                    setDeleteId(null);
                    toast.success(t("success"));
                  })
                  .catch(() => toast.error(t("error")))
              }
              disabled={deleteDeal.isPending}
            >
              {deleteDeal.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
