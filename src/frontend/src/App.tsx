import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  BarChart2,
  Building2,
  Calendar,
  Globe,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  ContactStatus,
  DealStage,
  useContacts,
  useDeals,
} from "./hooks/useQueries";
import Activities from "./pages/Activities";
import Contacts from "./pages/Contacts";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";

type Page =
  | "dashboard"
  | "contacts"
  | "pipeline"
  | "activities"
  | "reports"
  | "settings";

function SeedData() {
  const { actor } = useActor();
  const { data: contacts } = useContacts();
  const { data: deals } = useDeals();

  useEffect(() => {
    if (!actor || contacts === undefined || deals === undefined) return;
    if (contacts.length > 0 || deals.length > 0) return;

    const seed = async () => {
      try {
        const contactsData = [
          {
            name: "Νίκος Παπαδόπουλος",
            email: "nikos@hellatech.gr",
            phone: "+30 210 555 0101",
            company: "Ελληνική Τεχνολογία ΑΕ",
            status: ContactStatus.customer,
          },
          {
            name: "Μαρία Αντωνίου",
            email: "maria@innovagreece.gr",
            phone: "+30 210 555 0102",
            company: "Innova Ελλάς",
            status: ContactStatus.prospect,
          },
          {
            name: "Δημήτρης Κωνσταντίνου",
            email: "dimitris@agrosystems.gr",
            phone: "+30 210 555 0103",
            company: "Αγροσυστήματα ΕΠΕ",
            status: ContactStatus.lead,
          },
          {
            name: "Ελένη Χατζηδάκη",
            email: "eleni@mediamind.gr",
            phone: "+30 210 555 0104",
            company: "MediaMind Hellas",
            status: ContactStatus.customer,
          },
          {
            name: "Παναγιώτης Ζέρβας",
            email: "panagiotis@eurobuild.gr",
            phone: "+30 210 555 0105",
            company: "Ευρωκατασκευή ΑΕ",
            status: ContactStatus.prospect,
          },
        ];

        const ids = await Promise.all(
          contactsData.map((c) =>
            actor.createContact(c.name, c.email, c.phone, c.company, c.status),
          ),
        );

        const dealsData = [
          {
            title: "Σύστημα ERP - Ελληνική Τεχνολογία",
            contactId: ids[0],
            value: 45000,
            stage: DealStage.proposal,
            expectedCloseDate: "2026-06-30",
          },
          {
            title: "CRM Ανάπτυξη - Innova Ελλάς",
            contactId: ids[1],
            value: 28000,
            stage: DealStage.qualified,
            expectedCloseDate: "2026-07-15",
          },
          {
            title: "Γεωργικό Λογισμικό - Αγροσυστήματα",
            contactId: ids[2],
            value: 15000,
            stage: DealStage.newLead,
            expectedCloseDate: "2026-08-01",
          },
          {
            title: "Ψηφιακό Marketing - MediaMind",
            contactId: ids[3],
            value: 12000,
            stage: DealStage.negotiation,
            expectedCloseDate: "2026-05-31",
          },
          {
            title: "Κατασκευαστικό Λογισμικό - Ευρωκατασκευή",
            contactId: ids[4],
            value: 38000,
            stage: DealStage.closedWon,
            expectedCloseDate: "2026-04-30",
          },
        ];

        await Promise.all(
          dealsData.map((d) =>
            actor.createDeal(
              d.title,
              d.contactId,
              d.value,
              d.stage,
              d.expectedCloseDate,
            ),
          ),
        );

        toast.success("Sample data loaded!");
      } catch (e) {
        console.error("Seed error:", e);
      }
    };

    seed();
  }, [actor, contacts, deals]);

  return null;
}

function CRMLayout() {
  const [page, setPage] = useState<Page>("dashboard");
  const { t, lang, setLang } = useLanguage();
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { isFetching } = useActor();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const navItems: { key: Page; icon: React.ReactNode; label: string }[] = [
    {
      key: "dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: t("nav_dashboard"),
    },
    {
      key: "contacts",
      icon: <Users className="w-4 h-4" />,
      label: t("nav_contacts"),
    },
    {
      key: "pipeline",
      icon: <TrendingUp className="w-4 h-4" />,
      label: t("nav_pipeline"),
    },
    {
      key: "activities",
      icon: <Calendar className="w-4 h-4" />,
      label: t("nav_activities"),
    },
    {
      key: "reports",
      icon: <BarChart2 className="w-4 h-4" />,
      label: t("nav_reports"),
    },
    {
      key: "settings",
      icon: <Settings className="w-4 h-4" />,
      label: t("nav_settings"),
    },
  ];

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-8 max-w-sm w-full p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("app_name")}
            </h1>
            <p className="text-muted-foreground text-sm text-center">
              {t("app_subtitle")}
            </p>
          </div>
          <div className="w-full bg-card rounded-xl border border-border p-6 shadow-card flex flex-col gap-4">
            <p className="text-sm text-muted-foreground text-center">
              {t("login_desc")}
            </p>
            <Button
              data-ocid="auth.primary_button"
              className="w-full"
              onClick={() => login()}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {t("login")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} · Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    );
  }

  const principal = identity?.getPrincipal().toString() ?? "";
  const initials = principal.slice(0, 2).toUpperCase();

  const renderPage = () => {
    if (isFetching) {
      return (
        <div
          className="flex h-full items-center justify-center"
          data-ocid="app.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "contacts":
        return <Contacts />;
      case "pipeline":
        return <Pipeline />;
      case "activities":
        return <Activities />;
      case "reports":
        return <Reports />;
      case "settings":
        return <SettingsPage />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col"
        style={{ background: "oklch(var(--sidebar))" }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5"
          style={{ borderBottom: "1px solid oklch(var(--sidebar-border))" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sidebar-foreground font-semibold text-sm leading-tight">
                {t("app_name")}
              </p>
              <p
                className="text-xs"
                style={{ color: "oklch(var(--sidebar-foreground) / 0.5)" }}
              >
                ΕΠΑΛ · CRM
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5" data-ocid="nav.section">
          {navItems.map(({ key, icon, label }) => (
            <button
              type="button"
              key={key}
              data-ocid={`nav.${key}.link`}
              onClick={() => setPage(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                page === key
                  ? "bg-sidebar-accent text-sidebar-foreground font-semibold"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div
          className="px-3 py-4 space-y-2"
          style={{ borderTop: "1px solid oklch(var(--sidebar-border))" }}
        >
          {/* Language toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5">
            <Globe
              className="w-4 h-4"
              style={{ color: "oklch(var(--sidebar-foreground) / 0.5)" }}
            />
            <button
              type="button"
              data-ocid="settings.language.toggle"
              onClick={() => setLang(lang === "en" ? "gr" : "en")}
              className="text-xs transition-colors"
              style={{ color: "oklch(var(--sidebar-foreground) / 0.6)" }}
            >
              {lang === "en" ? "EN → ΕΛ" : "ΕΛ → EN"}
            </button>
          </div>
          {/* User + logout */}
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-primary text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span
              className="text-xs flex-1 truncate"
              style={{ color: "oklch(var(--sidebar-foreground) / 0.6)" }}
            >
              {principal.slice(0, 12)}…
            </span>
            <button
              type="button"
              data-ocid="auth.logout.button"
              onClick={() => clear()}
              title={t("logout")}
              className="hover:text-destructive transition-colors"
              style={{ color: "oklch(var(--sidebar-foreground) / 0.4)" }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
        <SeedData />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CRMLayout />
      <Toaster richColors position="top-right" />
    </LanguageProvider>
  );
}
