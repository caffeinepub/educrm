import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CheckSquare,
  DollarSign,
  Mail,
  Phone,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  ActivityStatus,
  ActivityType,
  useActivities,
  useContacts,
  useDeals,
  useStats,
} from "../hooks/useQueries";

const activityTypeIcon: Record<string, React.ReactNode> = {
  call: <Phone className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  meeting: <Video className="w-3.5 h-3.5" />,
  task: <CheckSquare className="w-3.5 h-3.5" />,
};

export default function Dashboard() {
  const { t } = useLanguage();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: activities, isLoading: activitiesLoading } = useActivities();
  const { data: contacts } = useContacts();
  const { data: deals } = useDeals();

  const totalContacts = contacts?.length ?? 0;
  const totalDeals = deals?.length ?? 0;
  const pipelineValue = stats?.totalPipelineValue ?? 0;
  const pendingCount = Number(stats?.pendingActivitiesCount ?? 0);

  const recentActivities = [...(activities ?? [])]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 6);

  type KpiItem = {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  };
  const kpis: KpiItem[] = [
    {
      label: t("total_contacts"),
      value: totalContacts,
      icon: <Users className="w-5 h-5 text-primary" />,
      color: "bg-blue-50",
    },
    {
      label: t("total_deals"),
      value: totalDeals,
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      color: "bg-emerald-50",
    },
    {
      label: t("pipeline_value"),
      value: `€${pipelineValue.toLocaleString("el-GR")}`,
      icon: <DollarSign className="w-5 h-5 text-amber-600" />,
      color: "bg-amber-50",
    },
    {
      label: t("pending_activities"),
      value: pendingCount,
      icon: <Calendar className="w-5 h-5 text-purple-600" />,
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="p-6 space-y-6" data-ocid="dashboard.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("dashboard_title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {t("dashboard_welcome")}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card
            key={kpi.label}
            className="border border-border shadow-card"
            data-ocid={`dashboard.kpi.card.${i + 1}`}
          >
            <CardContent className="pt-5 pb-5">
              {statsLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      {kpi.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {kpi.value}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${kpi.color}`}>
                    {kpi.icon}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <Card className="border border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {t("recent_activities")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div
              className="space-y-3"
              data-ocid="dashboard.activities.loading_state"
            >
              {["a", "b", "c"].map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-6"
              data-ocid="dashboard.activities.empty_state"
            >
              {t("no_activities")}
            </p>
          ) : (
            <div className="space-y-2">
              {recentActivities.map((act, idx) => (
                <div
                  key={act.id.toString()}
                  data-ocid={`dashboard.activity.item.${idx + 1}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {activityTypeIcon[act.activityType] ?? (
                      <Calendar className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{act.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {act.dueDate}
                    </p>
                  </div>
                  <Badge
                    variant={
                      act.status === ActivityStatus.done
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs flex-shrink-0"
                  >
                    {act.status === ActivityStatus.done
                      ? t("status_done")
                      : t("status_pending")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
