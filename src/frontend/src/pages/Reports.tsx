import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "../contexts/LanguageContext";
import { useDeals, useStats } from "../hooks/useQueries";

const PIE_COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#6366F1",
  "#EF4444",
  "#8B5CF6",
];

export default function Reports() {
  const { t } = useLanguage();
  const { data: stats, isLoading } = useStats();
  const { data: deals } = useDeals();

  const contactsData = (stats?.contactsByStatus ?? []).map(
    ([status, count]) => ({
      name: t(`status_${status}`),
      value: Number(count),
    }),
  );

  const dealsData = (stats?.dealsByStage ?? []).map(([stage, count]) => ({
    name: t(`stage_${stage}`),
    value: Number(count),
  }));

  const dealValueData = Object.values(
    (deals ?? []).reduce<Record<string, { name: string; value: number }>>(
      (acc, d) => {
        const key = d.stage;
        if (!acc[key]) acc[key] = { name: t(`stage_${key}`), value: 0 };
        acc[key].value += d.value;
        return acc;
      },
      {},
    ),
  );

  return (
    <div className="p-6 space-y-6" data-ocid="reports.page">
      <h1 className="text-2xl font-bold">{t("reports_title")}</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Contacts by Status - Pie */}
        <Card className="border border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {t("contacts_by_status")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton
                className="h-64 w-full"
                data-ocid="reports.pie.loading_state"
              />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={contactsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {contactsData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          PIE_COLORS[
                            contactsData.indexOf(entry) % PIE_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Deals by Stage - Bar */}
        <Card className="border border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("deals_by_stage")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton
                className="h-64 w-full"
                data-ocid="reports.bar.loading_state"
              />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={dealsData}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Value by Stage - Bar */}
        <Card className="border border-border shadow-card xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Pipeline Value by Stage (€)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={dealValueData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v: number) => [
                      `€${v.toLocaleString("el-GR")}`,
                      "Value",
                    ]}
                  />
                  <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
