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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import {
  type Contact,
  ContactStatus,
  useContacts,
  useCreateContact,
  useDeleteContact,
  useIsAdmin,
  useUpdateContact,
} from "../hooks/useQueries";

const statusColors: Record<string, string> = {
  customer: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lead: "bg-blue-100 text-blue-700 border-blue-200",
  prospect: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: ContactStatus;
};

const defaultForm: FormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: ContactStatus.lead,
};

export default function Contacts() {
  const { t } = useLanguage();
  const { data: contacts, isLoading } = useContacts();
  const { data: isAdmin } = useIsAdmin();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const filtered = (contacts ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingContact(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Contact) => {
    setEditingContact(c);
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      status: c.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingContact) {
        await updateContact.mutateAsync({ id: editingContact.id, ...form });
        toast.success(t("success"));
      } else {
        await createContact.mutateAsync(form);
        toast.success(t("success"));
      }
      setDialogOpen(false);
    } catch {
      toast.error(t("error"));
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteContact.mutateAsync(id);
      setDeleteId(null);
      toast.success(t("success"));
    } catch {
      toast.error(t("error"));
    }
  };

  const isPending = createContact.isPending || updateContact.isPending;

  return (
    <div className="p-6 space-y-5" data-ocid="contacts.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("contacts_title")}</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {t("all").toLowerCase()}
          </p>
        </div>
        <Button data-ocid="contacts.add_contact.button" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          {t("add_contact")}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="contacts.search_input"
          className="pl-9"
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3" data-ocid="contacts.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table data-ocid="contacts.table">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>{t("contact_name")}</TableHead>
                <TableHead>{t("contact_company")}</TableHead>
                <TableHead>{t("contact_email")}</TableHead>
                <TableHead>{t("contact_phone")}</TableHead>
                <TableHead>{t("contact_status")}</TableHead>
                <TableHead className="text-right">{t("edit")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="contacts.empty_state"
                  >
                    {t("no_contacts")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c, idx) => (
                  <TableRow
                    key={c.id.toString()}
                    data-ocid={`contacts.row.item.${idx + 1}`}
                    className="hover:bg-muted/20"
                  >
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.company}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.phone}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[c.status] ?? ""}`}
                      >
                        {t(`status_${c.status}`)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          data-ocid={`contacts.edit_button.${idx + 1}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {isAdmin && (
                          <Button
                            data-ocid={`contacts.delete_button.${idx + 1}`}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(c.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="contacts.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? t("edit_contact") : t("add_contact")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">{t("contact_name")}</Label>
              <Input
                data-ocid="contacts.name.input"
                id="c-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">{t("contact_email")}</Label>
              <Input
                data-ocid="contacts.email.input"
                id="c-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-phone">{t("contact_phone")}</Label>
              <Input
                data-ocid="contacts.phone.input"
                id="c-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-company">{t("contact_company")}</Label>
              <Input
                data-ocid="contacts.company.input"
                id="c-company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("contact_status")}</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as ContactStatus })
                }
              >
                <SelectTrigger data-ocid="contacts.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ContactStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`status_${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="contacts.cancel.button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              data-ocid="contacts.submit_button"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent data-ocid="contacts.delete.dialog">
          <DialogHeader>
            <DialogTitle>{t("delete_contact")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("confirm_delete")}</p>
          <DialogFooter>
            <Button
              data-ocid="contacts.delete.cancel_button"
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              {t("cancel")}
            </Button>
            <Button
              data-ocid="contacts.delete.confirm_button"
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleteContact.isPending}
            >
              {deleteContact.isPending && (
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
